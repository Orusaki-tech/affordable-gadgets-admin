import type { ArticleImage } from '../models/ArticleImage';
import type { ArticleImageRequest } from '../models/ArticleImageRequest';
import type { ArticleImageUpload } from '../models/ArticleImageUpload';
import type { ArticleImageUploadRequest } from '../models/ArticleImageUploadRequest';
import type { PaginatedArticleImageList } from '../models/PaginatedArticleImageList';
import type { PatchedArticleImageRequest } from '../models/PatchedArticleImageRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class ArticleImagesService {
    /**
     * CRUD for images embedded within a product buying guide / article body.
     * Only Content Creators and Inventory Managers can add/manage images.
     * @param page A page number within the paginated result set.
     * @returns PaginatedArticleImageList
     * @throws ApiError
     */
    static articleImagesList(page?: number): CancelablePromise<PaginatedArticleImageList>;
    /**
     * CRUD for images embedded within a product buying guide / article body.
     * Only Content Creators and Inventory Managers can add/manage images.
     * @param formData
     * @returns ArticleImage
     * @throws ApiError
     */
    static articleImagesCreate(formData: ArticleImageRequest): CancelablePromise<ArticleImage>;
    /**
     * CRUD for images embedded within a product buying guide / article body.
     * Only Content Creators and Inventory Managers can add/manage images.
     * @param id A unique integer value identifying this article image.
     * @returns ArticleImage
     * @throws ApiError
     */
    static articleImagesRetrieve(id: number): CancelablePromise<ArticleImage>;
    /**
     * CRUD for images embedded within a product buying guide / article body.
     * Only Content Creators and Inventory Managers can add/manage images.
     * @param id A unique integer value identifying this article image.
     * @param formData
     * @returns ArticleImage
     * @throws ApiError
     */
    static articleImagesUpdate(id: number, formData: ArticleImageRequest): CancelablePromise<ArticleImage>;
    /**
     * CRUD for images embedded within a product buying guide / article body.
     * Only Content Creators and Inventory Managers can add/manage images.
     * @param id A unique integer value identifying this article image.
     * @param formData
     * @returns ArticleImage
     * @throws ApiError
     */
    static articleImagesPartialUpdate(id: number, formData?: PatchedArticleImageRequest): CancelablePromise<ArticleImage>;
    /**
     * CRUD for images embedded within a product buying guide / article body.
     * Only Content Creators and Inventory Managers can add/manage images.
     * @param id A unique integer value identifying this article image.
     * @returns void
     * @throws ApiError
     */
    static articleImagesDestroy(id: number): CancelablePromise<void>;
    /**
     * Upload an image for embedding in a buying guide / article body.
     * Returns the Cloudinary URL. Does NOT create a persistent ArticleImage record.
     * @param formData
     * @returns ArticleImageUpload
     * @throws ApiError
     */
    static articleImagesUploadCreate(formData: ArticleImageUploadRequest): CancelablePromise<ArticleImageUpload>;
}
