import * as signalR from "@microsoft/signalr";
import { getAuthToken } from "@/api/client";

type UploadProgressCallback = (data: { mediaId: string; percentage: number; message: string }) => void;
type UploadCompletedCallback = (data: { mediaId: string; url: string }) => void;
type UploadFailedCallback = (data: { mediaId: string; error: string; retryCount: number }) => void;
type UploadFailedPermanentlyCallback = (data: { mediaId: string }) => void;

class SignalRService {
    private connection: signalR.HubConnection | null = null;
    private hubUrl: string = "/hubs/media-upload"; // Default, can be overridden

    constructor() { }

    public async startConnection(hubUrl?: string): Promise<void> {
        if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
            return;
        }

        const baseUrl = import.meta.env.VITE_API_URL || "";
        // Ensure hubUrl starts with / if not empty and doesn't have it
        let finalHubUrl = hubUrl || this.hubUrl;
        if (!finalHubUrl.startsWith("/")) {
            finalHubUrl = "/" + finalHubUrl;
        }

        // If baseUrl ends with /api/v1, we might need to strip it or adjust.
        // Usually hubs are at the root or specific path, not always under /api/v1.
        // Assuming the backend serves the hub at the root + hubUrl.
        // If VITE_API_URL includes /api/v1, we need to be careful.
        // Let's assume VITE_API_URL is the base URL of the server (e.g. https://new-cms-dev.runasp.net).
        // If it includes /api/v1, we should strip it for the hub connection if the hub is at root.

        let serverUrl = baseUrl;
        if (serverUrl.endsWith("/api/v1")) {
            serverUrl = serverUrl.replace("/api/v1", "");
        }
        if (serverUrl.endsWith("/")) {
            serverUrl = serverUrl.slice(0, -1);
        }

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(`${serverUrl}${finalHubUrl}`, {
                accessTokenFactory: () => getAuthToken() || "",
                withCredentials: false
            })
            .withAutomaticReconnect()
            .build();

        console.log(`Connecting to SignalR Hub at: ${serverUrl}${finalHubUrl}`);

        try {
            await this.connection.start();
            console.log("SignalR Connected");
        } catch (err) {
            console.error("SignalR Connection Error: ", err);
            throw err;
        }
    }

    public async joinUploadGroup(uploadId: string): Promise<void> {
        if (!this.connection) return;
        try {
            await this.connection.invoke("JoinUploadGroup", uploadId);
        } catch (err) {
            console.error("Error joining upload group: ", err);
        }
    }

    public async leaveUploadGroup(uploadId: string): Promise<void> {
        if (!this.connection) return;
        try {
            await this.connection.invoke("LeaveUploadGroup", uploadId);
        } catch (err) {
            console.error("Error leaving upload group: ", err);
        }
    }

    public onUploadProgress(callback: UploadProgressCallback): void {
        if (!this.connection) return;
        this.connection.on("UploadProgress", callback);
    }

    public onUploadCompleted(callback: UploadCompletedCallback): void {
        if (!this.connection) return;
        this.connection.on("UploadCompleted", callback);
    }

    public onUploadFailed(callback: UploadFailedCallback): void {
        if (!this.connection) return;
        this.connection.on("UploadFailed", callback);
    }

    public onUploadFailedPermanently(callback: UploadFailedPermanentlyCallback): void {
        if (!this.connection) return;
        this.connection.on("UploadFailedPermanently", callback);
    }

    public off(methodName: string): void {
        if (!this.connection) return;
        this.connection.off(methodName);
    }

    public async stopConnection(): Promise<void> {
        if (this.connection) {
            await this.connection.stop();
            this.connection = null;
        }
    }
}

export const signalRService = new SignalRService();
