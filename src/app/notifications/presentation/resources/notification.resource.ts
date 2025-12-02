/**
 * Notifications Bounded Context - Presentation Layer
 * Notification Resources (DTOs)
 */

import { NotificationType } from '../../domain/model/valueobjects/notification-type';

export interface NotificationResource {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: NotificationType | string;
  isRead: boolean;
  readAt: string | null;
  relatedEntityType: string | null;
  relatedEntityId: number | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Spring Boot paginated response
 */
export interface PagedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  numberOfElements: number;
  empty: boolean;
}
