import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    forwardRef,
    Inject,
    Input,
    Optional,
    Output,
    Self,
    ViewChild,
} from '@angular/core';
import {NgControl} from '@angular/forms';
import {
    AbstractTuiNullableControl,
    EMPTY_ARRAY,
    isNativeFocused,
    TUI_FOCUSABLE_ITEM_ACCESSOR,
    TUI_IS_MOBILE,
    tuiDefaultProp,
    TuiFocusableElementAccessor,
    TuiNativeFocusableElement,
    tuiPure,
} from '@taiga-ui/cdk';
import {
    MODE_PROVIDER,
    TUI_MODE,
    TuiAppearance,
    TuiBrightness,
    TuiSizeL,
} from '@taiga-ui/core';
import {TuiFileLike} from '@taiga-ui/kit/interfaces';
import {TUI_DIGITAL_INFORMATION_UNITS, TUI_INPUT_FILE_TEXTS} from '@taiga-ui/kit/tokens';
import {formatSize} from '@taiga-ui/kit/utils/files';
import {PolymorpheusContent} from '@tinkoff/ng-polymorpheus';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';

const DEFAULT_MAX_SIZE = 30 * 1000 * 1000; // 30 MB

// @dynamic
@Component({
    selector: 'tui-input-files',
    templateUrl: './input-files.template.html',
    styleUrls: ['./input-files.style.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        MODE_PROVIDER,
        {
            provide: TUI_FOCUSABLE_ITEM_ACCESSOR,
            useExisting: forwardRef(() => TuiInputFilesComponent),
        },
    ],
})
export class TuiInputFilesComponent
    extends AbstractTuiNullableControl<TuiFileLike | ReadonlyArray<TuiFileLike>>
    implements TuiFocusableElementAccessor
{
    private dataTransfer: DataTransfer | null = null;

    @Input()
    @tuiDefaultProp()
    link: PolymorpheusContent = '';

    @Input()
    @tuiDefaultProp()
    label: PolymorpheusContent = '';

    @Input()
    @tuiDefaultProp()
    accept = '';

    @Input()
    @tuiDefaultProp()
    multiple = false;

    @Input()
    @tuiDefaultProp()
    size: TuiSizeL = 'm';

    @Input()
    @tuiDefaultProp()
    maxFileSize = DEFAULT_MAX_SIZE;

    @Output()
    onReject = new EventEmitter<ReadonlyArray<TuiFileLike> | TuiFileLike>();

    @ViewChild('input')
    readonly input?: ElementRef<HTMLInputElement>;

    constructor(
        @Optional()
        @Self()
        @Inject(NgControl)
        control: NgControl | null,
        @Inject(ChangeDetectorRef)
        changeDetectorRef: ChangeDetectorRef,
        @Inject(TUI_IS_MOBILE)
        readonly isMobile: boolean,
        @Inject(TUI_INPUT_FILE_TEXTS)
        readonly inputFileTexts$: Observable<
            Record<
                | 'defaultLabelSingle'
                | 'defaultLabelMultiple'
                | 'defaultLinkSingle'
                | 'defaultLinkMultiple'
                | 'maxSizeRejectionReason'
                | 'formatRejectionReason'
                | 'drop'
                | 'dropMultiple',
                string
            >
        >,
        @Inject(TUI_MODE) readonly mode$: Observable<TuiBrightness | null>,
        @Inject(TUI_DIGITAL_INFORMATION_UNITS)
        readonly units$: Observable<[string, string, string]>,
    ) {
        super(control, changeDetectorRef);
    }

    get nativeFocusableElement(): TuiNativeFocusableElement | null {
        return this.input ? this.input.nativeElement : null;
    }

    get focused(): boolean {
        return isNativeFocused(this.nativeFocusableElement);
    }

    get computedLink$(): Observable<PolymorpheusContent> {
        return this.computeLink$(this.fileDragged, this.multiple, this.link);
    }

    get computedLabel$(): Observable<PolymorpheusContent> {
        return this.computeLabel$(
            this.isMobile,
            this.fileDragged,
            this.multiple,
            this.label,
        );
    }

    get fileDragged(): boolean {
        return !!this.dataTransfer && this.dataTransfer.types.indexOf('Files') !== -1;
    }

    get acceptArray(): readonly string[] {
        return this.getAcceptArray(this.accept);
    }

    get arrayValue(): ReadonlyArray<TuiFileLike> {
        return this.getValueArray(this.value);
    }

    onHovered(hovered: boolean) {
        this.updateHovered(hovered);
    }

    onFocused(focused: boolean) {
        this.updateFocused(focused);
    }

    onPressed(pressed: boolean) {
        this.updatePressed(pressed);
    }

    // TODO: refactor i18n messages
    onFilesSelected(
        input: HTMLInputElement,
        texts: Record<'maxSizeRejectionReason' | 'formatRejectionReason', string>,
        units: [string, string, string],
    ) {
        this.processSelectedFiles(input.files, texts, units);
        input.value = '';
    }

    onDropped(
        event: DataTransfer,
        texts: Record<'maxSizeRejectionReason' | 'formatRejectionReason', string>,
        units: [string, string, string],
    ) {
        this.processSelectedFiles(event.files, texts, units);
    }

    onDragOver(dataTransfer: DataTransfer | null) {
        this.dataTransfer = dataTransfer;
    }

    removeFile(removedFile: TuiFileLike) {
        this.updateValue(
            this.multiple ? this.arrayValue.filter(file => file !== removedFile) : null,
        );
    }

    getAppearance(mode: null | unknown): string {
        return mode === null ? '' : TuiAppearance.Outline;
    }

    @tuiPure
    private computeLink$(
        fileDragged: boolean,
        multiple: boolean,
        link: PolymorpheusContent,
    ): Observable<PolymorpheusContent> {
        if (fileDragged) {
            return of('');
        }

        return this.inputFileTexts$.pipe(
            map(texts =>
                multiple && link === ''
                    ? texts.defaultLinkMultiple
                    : link || texts.defaultLinkSingle,
            ),
        );
    }

    @tuiPure
    private computeLabel$(
        isMobile: boolean,
        fileDragged: boolean,
        multiple: boolean,
        label: PolymorpheusContent,
    ): Observable<PolymorpheusContent> {
        if (isMobile) {
            return of('');
        }

        if (fileDragged) {
            return this.inputFileTexts$.pipe(
                map(texts => (multiple ? texts.dropMultiple : texts.drop)),
            );
        }

        return this.inputFileTexts$.pipe(
            map(texts =>
                multiple && label === ''
                    ? texts.defaultLabelMultiple
                    : label || texts.defaultLabelSingle,
            ),
        );
    }

    @tuiPure
    private getValueArray(
        value: TuiFileLike | ReadonlyArray<TuiFileLike> | null,
    ): ReadonlyArray<TuiFileLike> {
        if (!value) {
            return EMPTY_ARRAY;
        }

        return value instanceof Array ? value : [value];
    }

    @tuiPure
    private getAcceptArray(accept: string): readonly string[] {
        return accept
            .toLowerCase()
            .split(',')
            .map(format => format.trim());
    }

    private processSelectedFiles(
        files: FileList | null,
        texts: Record<'maxSizeRejectionReason' | 'formatRejectionReason', string>,
        units: [string, string, string],
    ) {
        // IE11 after selecting a file through the open dialog generates a second event passing an empty FileList.
        if (files === null || files.length === 0) {
            return;
        }

        const newFiles = this.multiple ? Array.from(files) : [files[0]];
        const tooBigFiles = newFiles.filter(file => file.size > this.maxFileSize);
        const wrongFormatFiles = newFiles.filter(
            file => !this.isFormatAcceptable(file) && tooBigFiles.indexOf(file) === -1,
        );
        const acceptedFiles = newFiles.filter(
            file =>
                tooBigFiles.indexOf(file) === -1 && wrongFormatFiles.indexOf(file) === -1,
        );

        this.rejectFiles([
            ...tooBigFiles.map(file => ({
                name: file.name,
                type: file.type,
                size: file.size,
                content:
                    texts.maxSizeRejectionReason + formatSize(units, this.maxFileSize),
            })),
            ...wrongFormatFiles.map(file => ({
                name: file.name,
                type: file.type,
                size: file.size,
                content: texts.formatRejectionReason,
            })),
        ]);
        this.updateValue(
            this.multiple
                ? [...this.arrayValue, ...acceptedFiles]
                : acceptedFiles[0] || null,
        );
    }

    private isFormatAcceptable(file: File): boolean {
        if (!this.accept) {
            return true;
        }

        const extension = '.' + (file.name.split('.').pop() || '').toLowerCase();

        return this.acceptArray.some(
            format =>
                format === extension ||
                format === file.type ||
                (format.split('/')[1] === '*' &&
                    file.type.split('/')[0] === format.split('/')[0]),
        );
    }

    private rejectFiles(rejectedFiles: ReadonlyArray<TuiFileLike>) {
        this.onReject.emit(this.multiple ? rejectedFiles : rejectedFiles[0]);
    }
}
