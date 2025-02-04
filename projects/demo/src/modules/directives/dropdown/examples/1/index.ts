import {Component} from '@angular/core';
import {changeDetection} from '@demo/emulate/change-detection';
import {encapsulation} from '@demo/emulate/encapsulation';

@Component({
    selector: 'tui-dropdown-example-1',
    templateUrl: './index.html',
    styleUrls: ['./index.less'],
    changeDetection,
    encapsulation,
})
export class TuiDropdownExample1 {
    open = false;

    onClick() {
        this.open = !this.open;
    }

    onObscured(obscured: boolean) {
        if (obscured) {
            this.open = false;
        }
    }

    onActiveZone(active: boolean) {
        this.open = active && this.open;
    }
}
