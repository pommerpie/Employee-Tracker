const inquirer = require('inquirer');
const mysql = require('mysql2');
require('console.table')
require('dotenv').config();

// Startup Choices
const DB_Options = [
    'View all departments',
    'View all roles',
    'View all employees',
    'Add a department',
    'Add a role',
    'Add an employee',
    'Update an employee role',
    'View department budget'
]

// Database Connection
const db = mysql.createConnection(
    {
        host: 'localhost',
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: 'employee_directory'
    },
);

const init = () => {
    // Connection Process
    db.connect((err) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Connected to employee database');
            prompt1();
        }
    });
}
// Init User Input
const prompt1 = async () => {
    let input = await inquirer.prompt([
        {
            type: 'list',
            message: 'What would you like to do?',
            name: 'userChoice',
            choices: [...DB_Options]
        },
    ]);
    switch (input.userChoice) {
        // View Departments
        case DB_Options[0]:
            viewDepartments();
            break;
        // View Roles
        case DB_Options[1]:
            viewRoles();
            break;
        // View Employees
        case DB_Options[2]:
            viewEmployees();
            break;
        // Add Department
        case DB_Options[3]:
            addDepartment();
            break;
        // Add Role
        case DB_Options[4]:
            addRole();
            break;
        // Add Employee
        case DB_Options[5]:
            addEmployee();
            break;
        // Update Employee Role
        case DB_Options[6]:
            updateEmployeeRole();
            break;
        // View Department Budget
        case DB_Options[7]:
            departmentBudget();
            break;

    }
}

// FUNCTIONS START //


// Viewing Department function
const viewDepartments = () => {
    db.query('SELECT ID, NAME AS Department FROM department', (err, data) => {
        if (err) {
            console.log(err);
            return;
        }
        // Makes new line in console for format
        console.log('')
        // Inserts table
        console.table(data);
        // Refreshes app
        prompt1();
    });
}

// Viewing Roles function
const viewRoles = () => {
    db.query('SELECT role.ID, Title, department.NAME AS Department, Salary FROM role JOIN department ON role.department = department.id ORDER BY department.id;', (err, data) => {
        if (err) {
            console.log(err);
            return;
        }
        // Makes new line in console for format
        console.log('')
        // Inserts table
        console.table(data);
        // Refreshes app
        prompt1();
    });
}

// Viewing Employees function
const viewEmployees = () => {
    db.query('SELECT employee.ID, First_Name, Last_Name, Title, department.name AS Department, role.Salary FROM employee JOIN role ON employee.role = role.id JOIN department ON role.department = department.id ORDER BY department.id;', (err, data) => {
        if (err) {
            console.log(err);
            return;
        }
        // Makes new line in console for format
        console.log('')
        // Inserts table
        console.table(data);
        // Refreshes app
        prompt1();
    });
}

// Adding Department function
const addDepartment = async () => {
    let input = await inquirer.prompt([
        {
            type: 'input',
            message: 'Enter the new department name.',
            name: 'department',
        }
    ]);
    let sql = 'INSERT INTO department (name) VALUES (?)'
    db.query(sql, input.department, (err) => {
        if (err) {
            console.log(err);
            return;
        }
        console.log('\nDepartment created!\n');
        prompt1();
    })
}

// Adding Role function
const addRole = () => {
    db.query('SELECT * FROM department', (err, data) => {
        if (err) {
            console.log(err);
            return;
        } else {
            let departments = [];
            for (let point in data) {
                departments.push(data[point].name)
            }
            rolePrompt(departments);
        }
    })
    const rolePrompt = async (data) => {
        let input = await inquirer.prompt([
            {
                type: 'input',
                message: 'Enter the new role name.',
                name: 'role'
            },
            {
                type: 'input',
                message: 'Enter the salary for the role.',
                name: 'salary'
            },
            {
                type: 'list',
                message: 'Enter the department this role belongs to.',
                name: 'department',
                choices: [...data]
            }
        ])
        db.query('SELECT * FROM department WHERE name = (?)', input.department, (err, data) => {
            if (err) {
                console.log(err);
                return;
            } else {
                input.department = data[0].id;
                roleQuery(input);
            }
        })
    }
    const roleQuery = (input) => {
        let params = [input.role, input.department, input.salary]
        let sql = 'INSERT INTO role (title, department, salary) VALUES (?,?,?);'
        db.query(sql, params, (err) => {
            if (err) {
                console.log(err)
            } else {
                console.log('\nRole Added!\n')
                prompt1();
            }
        })
    }
}

// Adding Employee function
const addEmployee = () => {
    db.query('SELECT * FROM role ORDER BY department', (err, data) => {
        if (err) {
            console.log(err);
            return;
        } else {
            let roles = [];
            for (let point in data) {
                roles.push(data[point].title)
            }
            employeePrompt(roles);
        }
    })
    const employeePrompt = async (data) => {
        let input = await inquirer.prompt([
            {
                type: 'input',
                message: 'Enter the employees first name.',
                name: 'first'
            },
            {
                type: 'input',
                message: 'Enter the employees last name.',
                name: 'last'
            },
            {
                type: 'list',
                message: 'Enter the employees job title.',
                name: 'title',
                choices: [...data]
            }
        ])
        db.query('SELECT * FROM role WHERE title = (?)', input.title, (err, data) => {
            if (err) {
                console.log(err);
                return;
            } else {
                input.role = data[0].id;
                input.department = data[0].department;
                employeeQuery(input);
            }
        })
    }
    const employeeQuery = (input) => {
        let params = [input.first, input.last, input.role, input.department]
        let sql = 'INSERT INTO employee (first_name, last_name, role, department) VALUES (?,?,?,?);'
        db.query(sql, params, (err) => {
            if (err) {
                console.log(err)
            } else {
                console.log('\nEmployee Added!\n')
                prompt1();
            }
        })
    }
}

//  Update Employee Role function
const updateEmployeeRole = () => {
    let sql = 'SELECT employee.id as empID, employee.first_name, employee.last_name, role.title, role.id FROM employee RIGHT JOIN role ON employee.role = role.id'
    db.query(sql, (err, data) => {
        if (err) {
            console.log(err)
        } else {
            console.table(data)
            let list = [];
            for (let employee in data) {
                if (data[employee].first_name !== null) {
                    list.push(`${data[employee].first_name} ${data[employee].last_name}`)
                }
            }
            let list2 = [];
            for (let job in data) {
                if (!list2.includes(data[job].title)) {
                    list2.push(data[job].title)
                }
            }
            updatePrompt(list, list2, data);
        }
    })
    const updatePrompt = async (list, list2, data) => {
        let input = await inquirer.prompt([
            {
                type: 'list',
                message: 'Which employee would you like to update?',
                name: 'employee',
                choices: [...list]
            },
            {
                type: 'list',
                message: 'What is the new role?',
                name: 'newrole',
                choices: [...list2]
            }
        ])
        for (let i in data) {
            if (data[i].title === input.newrole) {
                input.roleID = data[i].id
            }
            if (`${data[i].first_name} ${data[i].last_name}` === input.employee) {
                input.empID = data[i].empID
            }
        }
        updateQuery(input);
    }
    const updateQuery = (input) => {
        let params = [input.roleID, input.empID]
        let sql = 'UPDATE employee SET role = (?) WHERE id = (?)'
        db.query(sql, params, (err) => {
            if (err) {
                console.log(err)
            } else {
                console.log('\nEmployee role updated!\n')
                prompt1();
            }
        })
    }
}

// Total Department Salaries function
const departmentBudget = () => {
    db.query('SELECT * FROM department', (err, data) => {
        if (err) {
            console.log(err);
            return;
        }
        let departments = [];
        for (let department in data) {
            departments.push(data[department].name)
        }
        departmentPrompt(departments, data);
    });
    const departmentPrompt = async (departments, data) => {
        let input = await inquirer.prompt([
            {
                type: 'list',
                message: 'Which departments budget would you like?',
                name: 'department',
                choices: [...departments]
            }
        ])
        db.query('SELECT Title, department.name AS department, role.salary FROM employee JOIN role ON employee.role = role.id JOIN department ON role.department = department.id ORDER BY department.id;', (err, data2) => {
            let total = 0;
            if(err) {
                console.log(err)
                return;
            } else {
                for(let group in data2){
                    if(data2[group].department === input.department) {
                        total += Number(data2[group].salary);
                    }
                }
                console.log(`The combined salaries of the ${input.department} department is ${total}`)
                prompt1();
            }
        })
    }
}

init();