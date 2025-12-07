// Barrel export for all API services
export { apiClient } from './client';
export { postsApi } from './posts.api';
export { usersApi } from './users.api';
export { rolesApi } from './roles.api';
export { categoriesApi } from './categories.api';
export { pagesApi } from './pages.api';
export { magazinesApi } from './magazines.api';
export { reelsApi } from './reels.api';
export type { GetPostsParams, PaginatedResponse } from './posts.api';
export type { Role, RolesResponse, GetRolesParams, CreateRoleDto, UpdateRoleDto } from './roles.api';
export type { User, UsersResponse, GetUsersParams } from './users.api';
export type { Category, GetCategoriesParams } from './categories.api';
export type { Page, PagesResponse, GetPagesParams, CreatePageRequest } from './pages.api';
export type { Magazine, MagazinesResponse, GetMagazinesParams } from './magazines.api';
export type {
    Reel,
    ReelsResponse,
    GetReelsParams,
    CreateReelRequest,
    UpdateReelRequest,
    MediaUploadResponse,
    MediaUploadStatusResponse
} from './reels.api';
