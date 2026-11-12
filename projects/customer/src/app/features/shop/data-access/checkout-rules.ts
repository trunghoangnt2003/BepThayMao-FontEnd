import { BranchOptionDto } from '@bepthaymao/api-client';

const PHONE = /^(\+84|0)[0-9]{9}$/;

export interface CheckoutProblem {
  readonly id: string;
  readonly message: string;
}

interface CheckoutValues {
  readonly address: string;
  readonly name: string;
  readonly phone: string;
  readonly acknowledged: boolean;
}

/** Kiểm tra phía khách theo thứ tự trường trên màn; máy chủ vẫn kiểm lại (409 nêu món hết). */
export function checkoutProblems(
  values: CheckoutValues,
  option: BranchOptionDto | null,
  missingNames: readonly string[],
): CheckoutProblem[] {
  const problems: CheckoutProblem[] = [];
  if (!values.address.trim())
    problems.push({ id: 'f-address', message: 'Nhập địa chỉ giao hàng.' });
  if (!option) problems.push({ id: 'branch-first', message: 'Chọn một cơ sở nhận đơn.' });
  else if (!option.acceptsOrders)
    problems.push({
      id: 'branch-first',
      message: `${option.name} tạm chưa nhận đơn. Hãy chọn cơ sở khác.`,
    });
  else if (missingNames.length > 0)
    problems.push({
      id: 'drop-missing',
      message: `${option.name} đang hết ${missingNames.join(', ')}.`,
    });
  if (option && !option.isOpenNow && !values.acknowledged)
    problems.push({ id: 'f-ack', message: 'Hãy xác nhận để đặt đơn giao vào ngày hôm sau.' });
  if (!values.name.trim()) problems.push({ id: 'f-name', message: 'Nhập họ và tên.' });
  if (!PHONE.test(values.phone))
    problems.push({ id: 'f-phone', message: 'Nhập số điện thoại hợp lệ, ví dụ 0901 234 567.' });
  return problems;
}
