/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AnalyticsService {
    /**
     * Published buying-guide (blog) article counts and recent updates.
     * @returns any No response body
     * @throws ApiError
     */
    public static analyticsBlogSummaryRetrieve(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/analytics/blog-summary/',
        });
    }
    /**
     * Admin endpoint: today's user activity feed (searches, cart adds, whatsapp clicks, logins).
     * @returns any No response body
     * @throws ApiError
     */
    public static analyticsDailyActivityRetrieve(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/analytics/daily-activity/',
        });
    }
    /**
     * Admin endpoint: today's active users with aggregated activity and phone.
     * @returns any No response body
     * @throws ApiError
     */
    public static analyticsDailyUsersRetrieve(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/analytics/daily-users/',
        });
    }
    /**
     * No-auth endpoint for Grafana datasource health check.
     * Returns connectivity and auth status so Grafana can verify
     * the JSON API datasource is working end-to-end.
     * @returns any No response body
     * @throws ApiError
     */
    public static analyticsDatasourceHealthRetrieve(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/analytics/datasource-health/',
        });
    }
    /**
     * Public endpoint to record user activity events.
     * Accepts optional session_key for anonymous tracking before login.
     * @returns any No response body
     * @throws ApiError
     */
    public static analyticsEventsCreate(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/analytics/events/',
        });
    }
    /**
     * Admin endpoint: aggregate marketing funnel data.
     * @returns any No response body
     * @throws ApiError
     */
    public static analyticsFunnelSummaryRetrieve(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/analytics/funnel-summary/',
        });
    }
    /**
     * All registered users with lifetime product interaction summary.
     * @returns any No response body
     * @throws ApiError
     */
    public static analyticsRegisteredUsersRetrieve(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/analytics/registered-users/',
        });
    }
    /**
     * Admin endpoint: list all users with signup date, last login, event counts.
     * @returns any No response body
     * @throws ApiError
     */
    public static analyticsUsersRetrieve(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/analytics/users/',
        });
    }
    /**
     * Admin endpoint: full activity timeline for one user.
     * @param userId
     * @returns any No response body
     * @throws ApiError
     */
    public static analyticsUsersRetrieve2(
        userId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/analytics/users/{user_id}/',
            path: {
                'user_id': userId,
            },
        });
    }
    /**
     * Grafana datasource endpoint — returns recent WhatsApp leads with phone,
     * product name, and timestamp. Requires valid Authorization: Token header
     * to prevent leaking contact info.
     * @returns any No response body
     * @throws ApiError
     */
    public static analyticsWhatsappLeadsRetrieve(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/analytics/whatsapp-leads/',
        });
    }
}
