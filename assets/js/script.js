const UTILS = {
    formatCurrency(value) {
        const signal = Number(value) < 0 
                            ? '-' 
                            : '';
        //remove tudo que não é número
        value = String(value).replace(/\D/g,'');
        value = Number(value) / 100;
        value = value.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }
        );
        return signal + value;
    },

    formatAmount( value ) {
        if( ! isNaN( value ) ){
            return Number(value) * 100;
        }
        return 0;
    },

    formatDate( value ) {
        if( value ){
            value = value.split('-').reverse().join('/');
            return value;
        }
        return '';
    }
};

const Storage = {
    key: 'controleFinanceiro:transactions',
    get getTransactions() {
        return JSON.parse( localStorage.getItem( this.key ) ) || [];
    },
    set setTransactions(transactions) {
        localStorage.setItem( this.key, JSON.stringify( transactions ) );
    }
}

const MODAL = {
    elementoHtml: document.querySelector('.modal-overlay'),
    elementMensagem: document.querySelector('#mensagem-modal'),
    elementoDescription: document.querySelector('#modal-description'),
    elementoAmount: document.querySelector('#modal-amount'),
    elementoDate: document.querySelector('#modal-date'),
    /**
     * Abrir e fechar Modal da nova transação
     */
    toggle() {
        this.elementoHtml
            .classList
            .toggle('active');
    },

    get getValues() {
        return {
            id: null,
            description: this.elementoDescription.value,
            amount: this.elementoAmount.value,
            date: this.elementoDate.value
        }
    },

    clearModal() {
        this.elementoDescription.value = '';
        this.elementoAmount.value = '';
        this.elementoDate.value = '';
    },

    submit(event) {
        event.preventDefault();

        try{

            transaction = this._formatarDados();
            this.add( transaction );

        }catch( error ){

            this.elementMensagem.innerHTML = error;
            this.elementMensagem.classList.add('error');

            setTimeout( function(){
                MODAL.elementMensagem.classList.remove('error');
            }, 2000);
        }
    },

    add( transaction ) 
    {
        if(this._validarAdd( transaction )){

            listTransactions.push( transaction );
            
            this.clearModal();
            this.toggle();

            App.reload();
        }
    },

    _validarAdd( { description, amount, date } )
    {
        if( description.trim() &&
            amount &&
            (date.trim() || date != '__/__/____')
        )
        {
            return true;
        }
        throw new Error('Por favor, preencha todos os campos!');
        return false;
    },

    _formatarDados() {
        const {id, description, amount, date } = this.getValues;

        return {
            id,
            description,
            amount: UTILS.formatAmount( amount ),
            date: UTILS.formatDate( date ),
        }

    }
};

let listTransactions = Storage.getTransactions;

const balance = {
    elementIncome: document.querySelector('#balance-income'),
    elementExpense: document.querySelector('#balance-expense'),
    elementTotal: document.querySelector('#balance-total'),

    /**
     * Somar as entradas
     */
    incomes() 
    {
        return listTransactions.reduce( ( acc, transac ) => {
            if( transac.amount > 0 ){
               return acc + transac.amount
            }
            return acc
        }, 0);
    },
    /**
     * Somar as saídas
     */
    expenses() 
    {
        return listTransactions.reduce( ( acc, transac ) => {
            if( transac.amount < 0 ){
               return acc + transac.amount
            }
            return acc
        }, 0);
    },
    /**
     * Total = incomes + (-expenses)
     */
    total() 
    {
        return this.incomes() + this.expenses();
    },

    updateBalance() 
    {
        this.elementIncome.innerHTML = UTILS.formatCurrency(this.incomes());
        this.elementExpense.innerHTML = UTILS.formatCurrency(this.expenses());
        this.elementTotal.innerHTML = UTILS.formatCurrency(this.total());
    }
};

const manipulationTransaction = {

    elementTbody: document.querySelector('#data-table tbody'),
    
    addTransaction(transaction, index) {
        const tr = document.createElement('tr');
        tr.innerHTML = this.makeTdsTransaction(transaction, index);
        this.elementTbody.appendChild(tr);
    },
    
    makeTdsTransaction( { id, description, amount, date }, index ) {
        
        return `            
            <td class="description"> 
                ${ description } 
            </td>
            
            <td 
                class="${ amount > 0 
                                ? 'income' 
                                : 'expense' }
            "> 
                ${ UTILS.formatCurrency(amount) } 
            </td>
            
            <td class="date"> 
                ${ date } 
            </td>
            
            <td>
                <img 
                    title="Remover transação"
                    class="cursor-pointer"
                    onclick="manipulationTransaction.removeTransaction( ${ index } )" 
                    src="./assets/images/minus.svg" 
                    alt="Remover transação"
                />
            </td>  
        `;
    },

    removeTransaction(index) {
        listTransactions.splice(index, 1);
        App.reload();
    },

    clearTbody() {
        this.elementTbody.innerHTML = '';
    }
};

const App = {
    init() {

        listTransactions.forEach((value, index) => {
            manipulationTransaction.addTransaction(value, index);
        });

        balance.updateBalance();

        Storage.setTransactions = listTransactions;
    },

    reload() {
        manipulationTransaction.clearTbody();
        this.init();
    }
};

App.init();
