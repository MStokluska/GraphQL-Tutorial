const { tasks, users } = require('../db');

const resolvers = {
    Task: {
        assignedTo(task) {
            return users.filter(u => u.taskId.includes(task.id));
        },
    },
    User: {
        task(user) {
            return tasks.filter(t => t.assignedTo.includes(user.id));
        },
    },

    Query: {
        tasks() {
            return tasks;
        },

        users() {
            return users;
        },

        userByName(parent, args, context, ) {
            const findIndex = users.findIndex(u => u.firstName === args.firstName)
            return users[findIndex]
        }
    },
    Mutation: {
        addTask(parent, args, context) {
            const newTask = {
                id: args.id,
                title: args.title,
                description: args.description,
                status: args.status,
                assignedTo: args.assignedTo,
            };

            let taskAssignedUser = users.find(u => u.id === args.assignedTo);
            taskAssignedUser.taskId = taskAssignedUser.taskId + args.id;

            tasks.push(newTask);

            return newTask;
        },

        removeTask(parent, args, context) {
            const taskIndex = tasks.findIndex(t => t.id === args.id);

            tasks.splice(taskIndex, 1);

            return tasks;
        },
    }
};

module.exports = resolvers;
