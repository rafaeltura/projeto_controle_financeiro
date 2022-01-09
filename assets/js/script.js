const MODAL = {
    open() {
        /**
         * Abrir Modal
         */
        document
            .querySelector('.modal-overlay')
            .classList
            .add('active');
    },
    close() {
        /**
         * Fechar Modal
         */
         document
            .querySelector('.modal-overlay')
            .classList
            .remove('active');
    }
};