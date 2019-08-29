const { tasks, users } = require('../db');

const resolvers = {
    Task: {
        assignedTo(task) {
            return users.filter(u => u.id === task.assignedTo);
        },
    },

    Query: {
        tasks() {
            return tasks;
        },

        users() {
            return users;
        },

        userByName(parent, args, context,){
            return users.filter(u => u.firstName === args.firstName)
        },
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
