/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CategoryEnum } from './CategoryEnum';
/**
 * Lightweight article payload for blog card carousels.
 */
export type PublicArticleCard = {
    /**
     * URL segment under /products/{product-slug}/blog/{slug}/
     */
    readonly slug?: string;
    /**
     * Public H1 for the article page (e.g. 'Galaxy A42 5G in Kenya: who should buy it?')
     */
    readonly headline?: string;
    readonly category?: CategoryEnum;
    /**
     * Featured image for blog lists and social sharing
     */
    readonly thumbnail_image?: string | null;
    readonly published_at?: string | null;
    readonly product_slug?: string;
    readonly product_name?: string;
};

