const DONE_CSS_CLASS = 'done';

export default class HtmlService {
    constructor(todoService, valueInput) {
        this.todoService = todoService;
        this.valueInput = valueInput;
        this.bindFromEvent();
        this.listTasks();
    }

    bindFromEvent() {
        const form = document.querySelector('form');
        form.addEventListener('submit', event => {
            event.preventDefault();
            this.createTask(form.item.value);
            console.log(form.item.value);
            form.reset();
        })
    }

    async createTask(description) {
        let task = {description, done: false};
        const createdTaskId = await this.todoService.save(task);
        task.id = createdTaskId;
        this.addToHtmlList(task);
    }

    async saveTask(taskId, isDone) {
        const task = await this.todoService.get(taskId);
        task.done = isDone;
        this.todoService.save(task);
    }

    async deleteTask(taskId, liRef) {
        await this.todoService.delete(taskId);
        liRef.remove();

    }

    async listTasks() {
        const tasks = await this.todoService.getAll();
        tasks.map((task) => this.addToHtmlList(task));
        console.log(tasks);
    }

    toggleTask(li) {
        const taskId = +li.getAttribute('data-item-id');
        li.classList.toggle(DONE_CSS_CLASS);
        const isDone = li.classList.contains(DONE_CSS_CLASS);
    }

    addToHtmlList(task) {
        const ul = document.querySelector('ul');
        const li = document.createElement('li');
        const span = document.createElement('span');
        const button = document.createElement('button');

        li.setAttribute('data-item', task.id);
        li.addEventListener('click', () => this.toggleTask(li))

        span.textContent = task.description;
        button.textContent = 'x';
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            this.deleteTask(task.id, li);
        });

        if(task.done) {
            li.classList.add(DONE_CSS_CLASS);
        }

        li.appendChild(span);
        li.appendChild(button);

        ul.appendChild(li);

    }



}