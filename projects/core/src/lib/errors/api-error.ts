import { HttpErrorResponse } from '@angular/common/http';

export interface ApiError {
  readonly kind: 'network' | 'http';
  readonly status: number;
  readonly title?: string;
  readonly detail?: string;
  readonly errors?: Readonly<Record<string, readonly string[]>>;
  readonly correlationId?: string;
  /** 409 khi đặt đơn: món đang hết ở cơ sở đã chọn (OrderConflictProblem). */
  readonly unavailableDishIds?: readonly string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function isApiError(value: unknown): value is ApiError {
  return (
    isRecord(value) &&
    typeof value['status'] === 'number' &&
    Number.isInteger(value['status']) &&
    ((value['kind'] === 'network' && value['status'] === 0) ||
      (value['kind'] === 'http' && value['status'] >= 100 && value['status'] <= 599))
  );
}

function validationErrors(value: unknown): ApiError['errors'] {
  if (
    !isRecord(value) ||
    !Object.values(value).every(
      (items: unknown) =>
        Array.isArray(items) && items.every((item: unknown) => typeof item === 'string'),
    )
  )
    return undefined;
  return value as Readonly<Record<string, readonly string[]>>;
}

function unavailableIds(value: unknown): readonly string[] | undefined {
  return Array.isArray(value)
    ? value.filter((id): id is string => typeof id === 'string')
    : undefined;
}

/** Trường tùy chọn của ProblemDetails, chỉ giữ khi đúng kiểu. */
function problemFields(
  body: Record<string, unknown>,
  fallbackId: string | null,
): Partial<ApiError> {
  const title = body['title'];
  const detail = body['detail'];
  const errors = validationErrors(body['errors']);
  const correlationId =
    typeof body['correlationId'] === 'string' ? body['correlationId'] : fallbackId;
  const unavailableDishIds = unavailableIds(body['unavailableDishIds']);
  return {
    ...(typeof title === 'string' ? { title } : {}),
    ...(typeof detail === 'string' ? { detail } : {}),
    ...(errors ? { errors } : {}),
    ...(correlationId ? { correlationId } : {}),
    ...(unavailableDishIds ? { unavailableDishIds } : {}),
  };
}

export function toApiError(error: unknown): ApiError {
  if (isApiError(error)) return error;
  if (!(error instanceof HttpErrorResponse) || error.status === 0) {
    return { kind: 'network', status: 0 };
  }
  const payload: unknown = error.error;
  const body = isRecord(payload) ? payload : {};
  return {
    kind: 'http',
    status: error.status,
    ...problemFields(body, error.headers.get('X-Correlation-Id')),
  };
}
