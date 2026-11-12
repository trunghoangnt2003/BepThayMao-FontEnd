import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { throwError } from 'rxjs';
import { BranchListPage } from './branch-list-page';
import { OwnerBranchesService } from '../../data-access/owner-branches.service';

it.each([
  new HttpErrorResponse({ status: 0 }),
  new HttpErrorResponse({ status: 500, error: '<html>failure</html>' }),
  new HttpErrorResponse({
    status: 400,
    error: {
      title: 'Invalid',
      detail: 'private-detail',
      errors: { name: ['Required'] },
      correlationId: 'body-id',
    },
  }),
  new HttpErrorResponse({
    status: 400,
    error: { title: {}, detail: 42, errors: { name: 1 } },
    headers: new HttpHeaders({ 'X-Correlation-Id': 'header-id' }),
  }),
  new HttpErrorResponse({ status: 500, error: { errors: ['invalid'] } }),
  new Error('private-detail'),
  null,
])('keeps error UI safe across malformed and transport responses', async (error: unknown) => {
  TestBed.configureTestingModule({
    providers: [
      { provide: OwnerBranchesService, useValue: { list: () => throwError(() => error) } },
    ],
  });
  const fixture = TestBed.createComponent(BranchListPage);
  await fixture.whenStable();
  const html = fixture.nativeElement as HTMLElement;
  expect(html.textContent).toContain('Không tải được danh sách cơ sở');
  expect(html.textContent).not.toContain('private-detail');
});
