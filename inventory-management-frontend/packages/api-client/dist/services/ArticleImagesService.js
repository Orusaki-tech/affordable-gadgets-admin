import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ArticleImagesService {
    /**
     * CRUD for images embedded within a product buying guide / article body.
     * Only Content Creators and Inventory Managers can add/manage images.
     * @param page A page number within the paginated result set.
     * @returns PaginatedArticleImageList
     * @throws ApiError
     */
    static articleImagesList(page) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/article-images/',
            query: {
                'page': page,
            },
        });
    }
    /**
     * CRUD for images embedded within a product buying guide / article body.
     * Only Content Creators and Inventory Managers can add/manage images.
     * @param formData
     * @returns ArticleImage
     * @throws ApiError
     */
    static articleImagesCreate(formData) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/article-images/',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * CRUD for images embedded within a product buying guide / article body.
     * Only Content Creators and Inventory Managers can add/manage images.
     * @param id A unique integer value identifying this article image.
     * @returns ArticleImage
     * @throws ApiError
     */
    static articleImagesRetrieve(id) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/article-images/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * CRUD for images embedded within a product buying guide / article body.
     * Only Content Creators and Inventory Managers can add/manage images.
     * @param id A unique integer value identifying this article image.
     * @param formData
     * @returns ArticleImage
     * @throws ApiError
     */
    static articleImagesUpdate(id, formData) {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/article-images/{id}/',
            path: {
                'id': id,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * CRUD for images embedded within a product buying guide / article body.
     * Only Content Creators and Inventory Managers can add/manage images.
     * @param id A unique integer value identifying this article image.
     * @param formData
     * @returns ArticleImage
     * @throws ApiError
     */
    static articleImagesPartialUpdate(id, formData) {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/article-images/{id}/',
            path: {
                'id': id,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * CRUD for images embedded within a product buying guide / article body.
     * Only Content Creators and Inventory Managers can add/manage images.
     * @param id A unique integer value identifying this article image.
     * @returns void
     * @throws ApiError
     */
    static articleImagesDestroy(id) {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/article-images/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Upload an image for embedding in a buying guide / article body.
     * Returns the Cloudinary URL. Does NOT create a persistent ArticleImage record.
     * @param formData
     * @returns ArticleImageUpload
     * @throws ApiError
     */
    static articleImagesUploadCreate(formData) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/article-images/upload/',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
}
