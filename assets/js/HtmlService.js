const EARNT_CSS_CLASS = 'earnt-item';
const SPENT_CSS_CLASS = 'spent-item';

export default class HtmlService {
    constructor(financeService, valueInput) {
        this.financeService = financeService;
        this.valueInput = valueInput;
        this.bindFromEvent();
        this.listFinances();
    }

    bindFromEvent() {
        const earntButton = document.getElementById('earnt-button');
        const spentButton = document.getElementById('spent-button');
        const form = document.querySelector('form');

        earntButton.addEventListener('click', event => {
            event.preventDefault();
            if(this.valueInput) {
                const value = this.valueInput.formatToNumber();
                const type = 1;
                this.createFinance(value, type);
            }
            form.reset();
        })

        spentButton.addEventListener('click', event => {
            event.preventDefault();
            if(this.valueInput) {
                const value = this.valueInput.formatToNumber();
                const type = 0;
                this.createFinance(value, type);
            }
            form.reset();
        })
        // form.addEventListener('submit', event => {
        //     event.preventDefault();
        //     this.createTask(form.item.value);
        //     console.log(form.item.value);
        //     form.reset();
        // })
    }

    async createFinance(value, type) {
        let finance = {value, type, createdAt: Date.now()};
        const createdFinanceId = await this.financeService.save(finance);
        finance.id = createdFinanceId;
        this.addToHtmlList(finance);
    }

    async createTask(description) {
        let task = {description, done: false};
        const createdTaskId = await this.financeService.save(task);
        task.id = createdTaskId;
        this.addToHtmlList(task);
    }

    async saveTask(taskId, isDone) {
        const task = await this.financeService.get(taskId);
        task.done = isDone;
        this.financeService.save(task);
    }

    async deleteFinance(taskId, liRef) {
        await this.financeService.delete(taskId);
        liRef.remove();

    }

    async listFinances() {
        const finances = await this.financeService.getAll();
        finances.map((finance) => this.addToHtmlList(finance));
        console.log(finances);
    }

    toggleTask(li) {
        const taskId = +li.getAttribute('data-item-id');
        li.classList.toggle(DONE_CSS_CLASS);
        const isDone = li.classList.contains(DONE_CSS_CLASS);
    }

    addToHtmlList(finance) {
        const ul = document.querySelector('ul');
        const li = document.createElement('li');
        const spanValue = document.createElement('span');
        const spanCreatedDate = document.createElement('span');
        const button = document.createElement('button');

        li.setAttribute('data-item', finance.id);
        li.addEventListener('click', () => this.toggleTask(li))

        const maskArgs = {
            prefix:  `R$ ${finance.type ? '' : '-'}`,
            suffix: '',
            fixed: true,
            fractionDigits: 2,
            decimalSeparator: ',',
            thousandsSeparator: '.',
        }

        spanValue.textContent = SimpleMaskMoney.formatToMask(finance.value, maskArgs);
        spanCreatedDate.textContent = new Date(finance.createdAt).toLocaleDateString();

        button.textContent = 'x';

        button.addEventListener('click', (event) => {
            event.stopPropagation();
            this.deleteFinance(finance.id, li);
        });

        li.classList.add(finance.type ? EARNT_CSS_CLASS : SPENT_CSS_CLASS);

        // if(task.done) {
        //     li.classList.add(DONE_CSS_CLASS);
        // }

        li.appendChild(spanValue);
        li.appendChild(spanCreatedDate);
        li.appendChild(button);

        ul.appendChild(li);

    }



}