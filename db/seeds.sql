INSERT INTO department (name)
VALUES 
    ('Engineering'),
    ('Finance'),
    ('Legal'),
    ('Sales');

INSERT INTO role (title, department, salary)
VALUES
    ('Sales Lead', 4, 100000),
    ('Salesperson', 4, 80000),
    ('Lead Engineer', 1, 150000),
    ('Software Engineer', 1, 120000),
    ('Account Manager', 2, 160000),
    ('Accountant', 2, 125000),
    ('Legal Team Lead', 3, 250000),
    ('Lawyer', 3, 190000);

INSERT INTO employee (first_name, last_name, role, department)
VALUES
    ('Daryl', 'Dixon', 1, 4),
    ('Rick','Grimes', 2, 4),
    ('Andrea','Harrison', 3, 1),
    ('Dale','Horvath', 4, 1),
    ('Glenn','Rhee', 5, 2),
    ('Maggie','Greene', 6, 2),
    ('Carol','Peletier', 7, 3),
    ('Shane','Walsh', 8, 3);