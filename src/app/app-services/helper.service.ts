import {Injectable} from '@angular/core';

@Injectable()
export class HelperService {

    currencySign = '£';

    constructor() {
    }

    cleanInput(value) {
        value = typeof value === 'string' ? value.replace(/\D/g, '') : value;
        return parseFloat(value) || 0;
    }

    formatCurrency(value) {
        try {
            value = this.cleanInput(value);
            value = value.toLocaleString('en-GB', {maximumFractionDigits: 2});
        } catch (e) {
            value = 0;
        }
        return this.currencySign + ' ' + value;
    }

    currencyToInterger(value) {
        try {
            value = this.cleanInput(value);
        } catch (e) {
            value = 0;
        }
        return value;
    }

    validateEmail(mail) {
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/.test(mail)) {
            return (true);
        }
        return (false);
    }

    padZero(number) {
        number = parseInt(number, 10);
        if (number < 10) {
            return '0' + number;
        }
        return number;
    }

    formatDate(date) {
        if (date && typeof date.getTime === 'function') {
            return date.getDate() + '/' + parseInt(date.getMonth() + 1, 10) + '/' + date.getFullYear()
                + ' ' + (date.getHours()) + ':' + this.padZero(date.getMinutes());
        } else {
            return '';
        }
    }


}
