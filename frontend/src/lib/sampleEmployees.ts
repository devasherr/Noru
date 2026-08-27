import type { Employee } from '../types/employee.ts'

/**
 * Stand-in roster used only when the API is unreachable and the user clicks
 * "Load sample data". Nothing loads this automatically — the dashboard never
 * silently swaps real data for this.
 */
export const sampleEmployees: Employee[] = [
  row(1, 'Amara', 'Bekele', 'amara.bekele@noru.co', '+251 911 204 118', '2021-03-14', true, 1, 'Front Office', 1, 'Front Desk Manager'),
  row(2, 'Daniel', 'Tesfaye', 'daniel.tesfaye@noru.co', '+251 911 663 902', '2022-07-01', true, 1, 'Front Office', 2, 'Receptionist'),
  row(3, 'Hanna', 'Girma', 'hanna.girma@noru.co', null, '2023-01-09', true, 1, 'Front Office', 3, 'Concierge'),
  row(4, 'Miriam', 'Haile', 'miriam.haile@noru.co', '+251 912 445 771', '2020-11-23', true, 2, 'Housekeeping', 4, 'Housekeeping Supervisor'),
  row(5, 'Selam', 'Abebe', null, '+251 913 118 240', '2023-05-30', true, 2, 'Housekeeping', 5, 'Room Attendant'),
  row(6, 'Yonas', 'Kebede', 'yonas.kebede@noru.co', '+251 914 552 013', '2024-02-12', true, 2, 'Housekeeping', 5, 'Room Attendant'),
  row(7, 'Ruth', 'Mengistu', 'ruth.mengistu@noru.co', null, '2019-08-05', false, 2, 'Housekeeping', 5, 'Room Attendant'),
  row(8, 'Tewodros', 'Alemu', 'tewodros.alemu@noru.co', '+251 915 907 664', '2018-06-18', true, 3, 'Food & Beverage', 6, 'Executive Chef'),
  row(9, 'Bethel', 'Solomon', 'bethel.solomon@noru.co', '+251 916 330 289', '2022-09-27', true, 3, 'Food & Beverage', 7, 'Sous Chef'),
  row(10, 'Kalkidan', 'Wolde', 'kalkidan.wolde@noru.co', '+251 917 741 556', '2026-08-05', true, 3, 'Food & Beverage', 8, 'Server'),
  row(11, 'Nahom', 'Assefa', null, '+251 918 226 807', '2026-08-18', true, 3, 'Food & Beverage', 8, 'Server'),
  row(12, 'Eyerusalem', 'Desta', 'eyerusalem.desta@noru.co', '+251 919 604 132', '2021-12-02', true, 3, 'Food & Beverage', 9, 'Bartender'),
  row(13, 'Samuel', 'Negash', 'samuel.negash@noru.co', '+251 920 815 470', '2020-04-16', true, 4, 'Maintenance', 10, 'Maintenance Lead'),
  row(14, 'Abel', 'Fikru', 'abel.fikru@noru.co', null, '2023-10-21', true, 4, 'Maintenance', 11, 'Technician'),
  row(15, 'Genet', 'Mulugeta', 'genet.mulugeta@noru.co', '+251 921 379 645', '2017-02-08', true, 5, 'Security', 12, 'Security Chief'),
  row(16, 'Dawit', 'Berhanu', null, '+251 922 460 918', '2024-06-11', false, 5, 'Security', 13, 'Security Officer'),
  row(17, 'Liya', 'Yohannes', 'liya.yohannes@noru.co', '+251 923 588 274', '2022-03-19', true, 6, 'Administration', 14, 'HR Officer'),
  row(18, 'Fitsum', 'Gebre', 'fitsum.gebre@noru.co', '+251 924 971 303', '2019-05-07', true, 6, 'Administration', 15, 'Accountant'),
  row(19, 'Meron', 'Tadesse', 'meron.tadesse@noru.co', null, '2025-01-13', true, 6, 'Administration', null, null),
  row(20, 'Bereket', 'Lemma', 'bereket.lemma@noru.co', '+251 925 142 668', '2025-11-04', true, null, null, null, null),
]

function row(
  id: number,
  first_name: string,
  last_name: string,
  email: string | null,
  phone: string | null,
  hire_date: string,
  is_active: boolean,
  department_id: number | null,
  department_name: string | null,
  role_id: number | null,
  role_title: string | null,
): Employee {
  return {
    id,
    first_name,
    last_name,
    email,
    phone,
    hire_date,
    is_active,
    department_id,
    department_name,
    role_id,
    role_title,
    created_at: `${hire_date}T08:00:00Z`,
    updated_at: `${hire_date}T08:00:00Z`,
  }
}
