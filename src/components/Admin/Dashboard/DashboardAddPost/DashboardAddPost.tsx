import {
  faCloudUpload,
  faFile,
  faFileLines,
  faFlag,
  faImages,
  faLightbulb,
  faList,
  faListCheck,
  faPlay,
  faUser,
  faVideo,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import ContentTypeSelector from "./ContentTypeSelector/ContentTypeSelector";
import { useTranslation } from "react-i18next";

type NameType =
  | "Article"
  | "Gallery"
  | "sorted-list"
  | "Table of Contents"
  | "Video"
  | "Audio"
  | "Reel"
const getContentTypes = (): ContentType[] => [
  {
    id: 1,
    name: "Article",
    icon: faFile,
    descriptionKey: "contentTypes.articleDesc",
  },
  {
    id: 2,
    name: "Gallery",
    icon: faImages,
    descriptionKey: "contentTypes.galleryDesc",
  },
  {
    id: 3,
    name: "sorted-list",
    icon: faListCheck,
    descriptionKey: "contentTypes.sortedListDesc",
  },
  {
    id: 4,
    name: "Table of Contents",
    icon: faList,
    descriptionKey: "contentTypes.tableOfContentsDesc",
  },
  {
    id: 5,
    name: "Video",
    icon: faCloudUpload,
    descriptionKey: "contentTypes.videoDesc",
  },
  {
    id: 6,
    name: "Audio",
    icon: faPlay,
    descriptionKey: "contentTypes.audioDesc",
  },
  {
    id: 7,
    name: "Reel",
    icon: faVideo,
    descriptionKey: "contentTypes.reelDesc",
  },

];

export interface ContentType {
  id: number;
  name: NameType;
  icon: IconDefinition;
  descriptionKey: string;
}

export default function DashboardAddPost() {
  const { t } = useTranslation();
  const contentTypes = getContentTypes();

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-slate-800 ">
          {t('formLabels.choosePostFormat')}
        </h2>
        <button className="flex items-center gap-2 text-sm bg-primary text-white font-semibold px-4 py-2 rounded-md hover:opacity-90 transition-opacity">
          <span className="material-icons-outlined text-lg">article</span> {t('formLabels.posts')}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {contentTypes.map((type) => (
          <ContentTypeSelector key={type.id} type={type} />
        ))}
      </div>
    </div>
  );
}
