const IS_EDITING_CSS_CLASS = 'in-edition';
const EARNT_CSS_CLASS = 'earnt-item';
const SPENT_CSS_CLASS = 'spent-item';
const maskArgs = {
    allowNegative: false,
    negativeSignAfter: false,
    prefix: 'R$ ',
    suffix: '',
    fixed: true,
    fractionDigits: 2,
    decimalSeparator: ',',
    thousandsSeparator: '.',
    cursor: 'end'
};

const maskLabelArgs = {
    allowNegative: false,
    negativeSignAfter: false,
    prefix: 'R$ ',
    suffix: '',
    fixed: true,
    decimalSeparator: ',',
    thousandsSeparator: '.',
    cursor: 'end'
}

export default class HtmlService {


    constructor(financeService, valueInput) {
        this.financeService = financeService;
        
        this.currentFinance = null;
        this.finances = [];

        this.valueInput = valueInput;
        this.totalFinancesSpan = null;
        this.totalEarntSpan = null;
        this.totalSpentSpan = null;

        this.bindFromEvent();
        this.getTotalSpans();
        this.listFinances();
    }

    getTotalSpans() {
        this.totalFinancesSpan = document.getElementById('total-finances-value');
        this.totalEarntSpan = document.getElementById('total-earnt-value');
        this.totalSpentSpan = document.getElementById('total-spent-value');
    }

    bindFromEvent() {
        const earntButton = document.getElementById('earnt-button');
        const spentButton = document.getElementById('spent-button');
        const updateButton = document.getElementById('update-button');
        const cancelButton = document.getElementById('cancel-button');
        const form = document.querySelector('form');

        earntButton.addEventListener('click', event => {
            event.preventDefault();
            if(this.valueInput) {
                const value = this.valueInput.formatToNumber();
                if(value && Number(value)) {
                    const type = 1;
                    this.createFinance(value, type);
                }
                this.resetInputAndSetMask();
            }
        })

        spentButton.addEventListener('click', event => {
            event.preventDefault();
            if(this.valueInput) {
                const value = this.valueInput.formatToNumber();
                if(value && Number(value)) {
                    const type = 0;
                    this.createFinance(value, type);
                }
                this.resetInputAndSetMask();
            }
        });

        updateButton.addEventListener('click', event => {
            event.preventDefault();
            if(this.valueInput && this.currentFinance && this.currentFinance.id) {
                const value = this.valueInput.formatToNumber();
                if(value && Number(value)) {
                    const type = 0;
                    this.updateFinance(value);
                }
                this.resetInputAndSetMask();
            }
        });

        cancelButton.addEventListener('click', event => {
            event.preventDefault();
            this.currentFinance = null;
            this.resetInputAndSetMask();
            const items = Array.from(document.querySelector('ul').getElementsByTagName('li'));
            items.forEach(childNode => {
                childNode.classList = [];
            });
            this.enableCreatingMode();

        })
    }

    async createFinance(value, type) {
        let finance = {value, type, createdAt: Date.now()};
        const createdFinanceId = await this.financeService.save(finance);
        finance.id = createdFinanceId;
        this.finances.push(finance);
        this.addToHtmlList(finance);
        this.updateState();
    }

    resetInputAndSetMask() {
        this.valueInput.value = '0,00';
        this.valueInput = SimpleMaskMoney.setMask('#value', maskArgs);
    }

    enableEditingMode() {
        const creatingActions = document.getElementById('creating-actions');
        if(creatingActions) creatingActions.style.display = "none";
        const editingActions = document.getElementById('editing-actions');
        if(editingActions) editingActions.style.display = "block";
    }

    enableCreatingMode() {
        const creatingActions = document.getElementById('creating-actions');
        if(creatingActions) creatingActions.style.display = "block";
        const editingActions = document.getElementById('editing-actions');
        if(editingActions) editingActions.style.display = "none";
    }

    async updateFinance(value) {
        const finance = this.currentFinance;
        finance.value = value;
        await this.financeService.save(finance);
        this.finances = this.finances.map(item => item.id === finance.id ? finance : item);
        const ul = document.querySelector('ul');
        if(ul) ul.innerHTML = '';
        await this.listFinances();
        this.currentFinance = null;
        this.resetInputAndSetMask();
        this.enableCreatingMode();
    }

    async deleteFinance(financeId, liRef) {
        await this.financeService.delete(financeId);
        this.finances = this.finances.filter(finance => finance.id !== financeId);
        liRef.remove();
        this.updateState();

    }

    async listFinances() {
        this.finances = await this.financeService.getAll();
        this.finances.map((finance) => this.addToHtmlList(finance));
        this.updateState();
    }

    enableToEdit(li) {
        const financeId = +li.getAttribute('data-item-id');

        const items = Array.from(document.querySelector('ul').getElementsByTagName('li'));
        items.forEach(childNode => {
            childNode.classList = childNode.getAttribute('data-item-id') === `${financeId}` 
                ? [IS_EDITING_CSS_CLASS]
                : [];
        });

        const finance = this.finances.find(item => item.id === financeId);
        if(finance) {
            this.currentFinance = finance;
            this.enableEditingMode();
            const editingType = document.getElementById('editing-finance-type');
            if(editingType) editingType.innerHTML = `Type: ${finance.type ? 'Earnt' : 'Spent'}`;
            const editingOldValue = document.getElementById('editing-finance-old-value');
            if(editingOldValue) {
                maskLabelArgs.prefix = 'R$ '
                finance.value = Number(finance.value.toFixed(2));
                this.valueInput.value = SimpleMaskMoney.formatToMask(finance.value, maskArgs);
                const oldValue = SimpleMaskMoney.formatToMask(finance.value, maskLabelArgs);
                editingOldValue.innerHTML = `Old Value: ${oldValue}`;
            }
        }
    }

    addToHtmlList(finance) {
        const ul = document.querySelector('ul');
        const li = document.createElement('li');
        const spanValue = document.createElement('span');
        const spanCreatedDate = document.createElement('span');
        const button = document.createElement('button');

        li.setAttribute('data-item-id', finance.id);
        li.addEventListener('click', () => this.enableToEdit(li));

        maskLabelArgs.prefix = `R$ ${finance.type ? '' : '-'}`;

        spanValue.textContent = SimpleMaskMoney.formatToMask(finance.value, maskLabelArgs);
        spanCreatedDate.textContent = new Date(finance.createdAt).toLocaleDateString();

        button.textContent = 'x';

        button.addEventListener('click', (event) => {
            event.stopPropagation();
            this.deleteFinance(finance.id, li);
        });

        li.classList.add(finance.type ? EARNT_CSS_CLASS : SPENT_CSS_CLASS);
        spanValue.classList.add(finance.type ? 'green-text' : 'red-text');

        // if(task.done) {
        //     li.classList.add(DONE_CSS_CLASS);
        // }

        li.appendChild(spanValue);
        li.appendChild(spanCreatedDate);
        li.appendChild(button);

        ul.appendChild(li);

    }

    updateState() {

        let totalFinances = 0, totalEarnt = 0, totalSpent = 0;
        this.finances.forEach(finance => {
            finance.type 
                ? totalEarnt += finance.value
                : totalSpent -= finance.value;

        });

        totalFinances = Number(totalFinances.toFixed(2));
        totalEarnt = Number(totalEarnt.toFixed(2));
        totalSpent = Number(totalSpent.toFixed(2));
        totalFinances = totalEarnt + totalSpent;
        totalFinances = Number(totalFinances.toFixed(2));

        // let totalFinancesFixed = totalFinances.toFixed(2);
        // totalFinances = Number(totalFinancesFixed);

        maskLabelArgs.prefix = `R$ ${totalFinances >= 0 ? '' : '-'}`;
        this.totalFinancesSpan.innerHTML = SimpleMaskMoney.formatToMask(`${totalFinances}`.replace('.', ''), maskLabelArgs);  
        maskLabelArgs.prefix = `R$ ${totalEarnt >= 0 ? '' : '-'}`;    
        this.totalEarntSpan.innerHTML = SimpleMaskMoney.formatToMask(`${totalEarnt}`.replace('.', ''), maskLabelArgs);   
        maskLabelArgs.prefix = `R$ ${totalSpent >= 0 ? '' : '-'}`;     
        this.totalSpentSpan.innerHTML = SimpleMaskMoney.formatToMask(`${totalSpent}`.replace('.', ''), maskLabelArgs);        

    }



}