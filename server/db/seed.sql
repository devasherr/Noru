-- Development seed data for the hotel EMS.
--
-- Run with:
--   docker exec -i hotel_ems_db psql -U hotel_admin -d hotel_ems < db/seed.sql
--
-- DESTRUCTIVE: this truncates every table and restarts the id sequences so the
-- data set is identical on every run. Do not point it at anything but a local
-- development database.
--
-- Shift rota and attendance are generated relative to CURRENT_DATE, so the last
-- 14 days always contain data no matter when you run it.

BEGIN;

-- Shift start/end are plain TIME values, so the check_in/check_out timestamps
-- below are built from naive wall-clock times. Pin the zone the hotel operates
-- in for this transaction so a 22:00 shift start is stored as 22:00 local rather
-- than 22:00 in whatever zone the server happens to run in.
SET LOCAL TimeZone TO 'Africa/Addis_Ababa';

TRUNCATE attendance, employee_shifts, employees, shifts, roles, departments
    RESTART IDENTITY CASCADE;

INSERT INTO departments (name, description) VALUES
    ('Front Office',    'Reception, reservations and guest relations'),
    ('Housekeeping',    'Guest rooms, laundry and public areas'),
    ('Food & Beverage', 'Restaurant and bar service'),
    ('Kitchen',         'Food preparation and stores'),
    ('Maintenance',     'Engineering, plumbing and electrical repairs'),
    ('Security',        'Premises, asset and guest safety'),
    ('Administration',  'Human resources, finance and management');

INSERT INTO roles (title, description) VALUES
    ('Front Desk Agent',        'Checks guests in and out, handles the front desk'),
    ('Reservations Officer',    'Manages bookings and room availability'),
    ('Guest Relations Officer', 'Handles guest requests and complaints'),
    ('Housekeeping Supervisor', 'Assigns and inspects room cleaning'),
    ('Room Attendant',          'Cleans and prepares guest rooms'),
    ('Laundry Attendant',       'Operates laundry and linen supply'),
    ('Waiter',                  'Serves food and drinks in the restaurant'),
    ('Bartender',               'Prepares and serves beverages'),
    ('Head Chef',               'Runs the kitchen and designs the menu'),
    ('Sous Chef',               'Second in command in the kitchen'),
    ('Line Cook',               'Prepares dishes on an assigned station'),
    ('Maintenance Technician',  'Repairs building systems and equipment'),
    ('Security Guard',          'Patrols the premises and screens visitors'),
    ('HR Officer',              'Handles hiring, records and payroll input'),
    ('Accountant',              'Keeps the books and processes payments'),
    ('General Manager',         'Overall responsibility for hotel operations');

INSERT INTO shifts (name, start_time, end_time) VALUES
    ('Morning',   '06:00', '14:00'),
    ('Afternoon', '14:00', '22:00'),
    ('Night',     '22:00', '06:00'),
    ('Office',    '09:00', '17:00');

-- Departments and roles are referenced by name so the rows stay readable and
-- survive any future reordering of the inserts above. The leading column is the
-- employee id each row lands on: the joins below would otherwise reorder rows
-- before the serial is assigned, so the insert is explicitly ordered by it.
WITH staff (seq, first_name, last_name, email, phone, hire_date, is_active, department, role) AS (
    VALUES
        (1,  'Amina',   'Yusuf',     'amina.yusuf@noruhotel.test',     '+251911000101', '2021-03-15', TRUE,  'Front Office',    'Front Desk Agent'),
        (2,  'Bekele',  'Tadesse',   'bekele.tadesse@noruhotel.test',  '+251911000102', '2022-07-01', TRUE,  'Front Office',    'Front Desk Agent'),
        (3,  'Hana',    'Girma',     'hana.girma@noruhotel.test',      '+251911000103', '2020-01-20', TRUE,  'Front Office',    'Reservations Officer'),
        (4,  'Dawit',   'Mekonnen',  'dawit.mekonnen@noruhotel.test',  '+251911000104', '2023-11-06', TRUE,  'Front Office',    'Guest Relations Officer'),
        (5,  'Selam',   'Abebe',     'selam.abebe@noruhotel.test',     '+251911000105', '2019-05-02', TRUE,  'Housekeeping',    'Housekeeping Supervisor'),
        (6,  'Meron',   'Haile',     'meron.haile@noruhotel.test',     NULL,            '2022-02-14', TRUE,  'Housekeeping',    'Room Attendant'),
        (7,  'Tigist',  'Alemu',     'tigist.alemu@noruhotel.test',    '+251911000107', '2023-06-19', TRUE,  'Housekeeping',    'Room Attendant'),
        (8,  'Yonas',   'Desta',     NULL,                            '+251911000108', '2024-09-02', TRUE,  'Housekeeping',    'Room Attendant'),
        (9,  'Kidist',  'Bekele',    'kidist.bekele@noruhotel.test',   '+251911000109', '2021-10-11', TRUE,  'Housekeeping',    'Laundry Attendant'),
        (10, 'Samuel',  'Tesfaye',   'samuel.tesfaye@noruhotel.test',  '+251911000110', '2020-08-24', TRUE,  'Food & Beverage', 'Waiter'),
        (11, 'Rahel',   'Getachew',  'rahel.getachew@noruhotel.test',  '+251911000111', '2023-01-09', TRUE,  'Food & Beverage', 'Waiter'),
        (12, 'Nahom',   'Assefa',    'nahom.assefa@noruhotel.test',    '+251911000112', '2022-04-18', TRUE,  'Food & Beverage', 'Bartender'),
        (13, 'Eyob',    'Kebede',    'eyob.kebede@noruhotel.test',     '+251911000113', '2018-11-05', TRUE,  'Kitchen',         'Head Chef'),
        (14, 'Liya',    'Solomon',   'liya.solomon@noruhotel.test',    '+251911000114', '2021-06-28', TRUE,  'Kitchen',         'Sous Chef'),
        (15, 'Abel',    'Negash',    'abel.negash@noruhotel.test',     '+251911000115', '2024-02-12', TRUE,  'Kitchen',         'Line Cook'),
        (16, 'Fikadu',  'Wolde',     'fikadu.wolde@noruhotel.test',    '+251911000116', '2023-08-07', TRUE,  'Kitchen',         'Line Cook'),
        (17, 'Getu',    'Lemma',     'getu.lemma@noruhotel.test',      '+251911000117', '2020-03-30', TRUE,  'Maintenance',     'Maintenance Technician'),
        (18, 'Solomon', 'Ayele',     'solomon.ayele@noruhotel.test',   '+251911000118', '2019-09-16', TRUE,  'Security',        'Security Guard'),
        (19, 'Tesfaye', 'Gebre',     'tesfaye.gebre@noruhotel.test',   '+251911000119', '2022-12-01', TRUE,  'Security',        'Security Guard'),
        (20, 'Marta',   'Fikru',     'marta.fikru@noruhotel.test',     '+251911000120', '2021-01-25', TRUE,  'Administration',  'HR Officer'),
        (21, 'Biniam',  'Teshome',   'biniam.teshome@noruhotel.test',  '+251911000121', '2019-02-04', TRUE,  'Administration',  'Accountant'),
        (22, 'Sara',    'Mulugeta',  'sara.mulugeta@noruhotel.test',   '+251911000122', '2017-06-01', TRUE,  'Administration',  'General Manager'),
        -- former staff, kept for attendance history
        (23, 'Helen',   'Zewdie',    'helen.zewdie@noruhotel.test',    '+251911000123', '2020-04-14', FALSE, 'Food & Beverage', 'Waiter'),
        (24, 'Robel',   'Araya',     'robel.araya@noruhotel.test',     '+251911000124', '2021-11-22', FALSE, 'Housekeeping',    'Room Attendant'),
        (25, 'Genet',   'Alemayehu', 'genet.alemayehu@noruhotel.test', NULL,            '2018-07-09', FALSE, 'Kitchen',         'Line Cook'),
        -- new hire not yet assigned to a department or role
        (26, 'Yared',   'Tilahun',   'yared.tilahun@noruhotel.test',   '+251911000126', CURRENT_DATE::text, TRUE, NULL, NULL)
)
INSERT INTO employees (
    first_name, last_name, email, phone, hire_date, is_active, department_id, role_id
)
SELECT
    s.first_name,
    s.last_name,
    s.email,
    s.phone,
    s.hire_date::date,
    s.is_active,
    d.id,
    r.id
FROM staff s
LEFT JOIN departments d ON d.name = s.department
LEFT JOIN roles r ON r.title = s.role
ORDER BY s.seq;

-- Rota for the last 14 days: active, assigned staff rotate through the three
-- floor shifts every three days, admin staff work the office shift on weekdays,
-- and every employee gets a staggered rest day each week.
INSERT INTO employee_shifts (employee_id, shift_id, work_date)
SELECT rota.employee_id, s.id, rota.work_date
FROM (
    SELECT
        e.id AS employee_id,
        cal.work_date,
        d.name AS department,
        CASE
            WHEN d.name = 'Administration' THEN 'Office'
            ELSE (ARRAY['Morning', 'Afternoon', 'Night'])[1 + (e.id + cal.day_index / 3) % 3]
        END AS shift_name
    FROM employees e
    JOIN departments d ON d.id = e.department_id
    CROSS JOIN (
        SELECT (CURRENT_DATE - 13 + g)::date AS work_date, g AS day_index
        FROM generate_series(0, 13) AS g
    ) cal
    WHERE e.is_active
      AND (cal.day_index + e.id) % 7 <> 0
) rota
JOIN shifts s ON s.name = rota.shift_name
WHERE NOT (rota.department = 'Administration' AND EXTRACT(ISODOW FROM rota.work_date) > 5);

-- One attendance record per rostered shift. Roughly 7% on leave, 9% absent and
-- 12% late; today's shifts are checked in but not yet checked out.
INSERT INTO attendance (employee_shift_id, check_in, check_out, status)
SELECT
    planned.id,
    CASE planned.status
        WHEN 'absent'   THEN NULL
        WHEN 'on_leave' THEN NULL
        WHEN 'late'     THEN planned.starts_at + INTERVAL '22 minutes'
        ELSE planned.starts_at - INTERVAL '4 minutes'
    END,
    CASE
        WHEN planned.status IN ('absent', 'on_leave') THEN NULL
        WHEN planned.work_date = CURRENT_DATE THEN NULL
        ELSE planned.ends_at + INTERVAL '6 minutes'
    END,
    planned.status
FROM (
    SELECT
        es.id,
        es.work_date,
        es.work_date + s.start_time AS starts_at,
        es.work_date + s.end_time
            + CASE WHEN s.end_time <= s.start_time THEN INTERVAL '1 day' ELSE INTERVAL '0 day' END
            AS ends_at,
        CASE
            WHEN es.id % 17 = 0 THEN 'on_leave'
            WHEN es.id % 11 = 0 THEN 'absent'
            WHEN es.id % 7  = 0 THEN 'late'
            ELSE 'present'
        END AS status
    FROM employee_shifts es
    JOIN shifts s ON s.id = es.shift_id
) planned;

COMMIT;
