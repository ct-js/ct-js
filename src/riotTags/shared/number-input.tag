//-
    An input that behaves like a number input but allows arbitrary values while still using min, max and step values.
    min and max values can also be optional for manual input.

    @attribute [value] (number) The current value of the input. Defaults to 0.
    @attribute [step] (number) The step value for the input. Defaults to 1.
    @attribute [min] (number) The minimum value for the input. Defaults to -Infinity.
    @attribute [max] (number) The maximum value for the input. Defaults to Infinity.
    @attribute [disabled] (atomic) Whether the input is disabled.

    @attribute [allowoutsidemin] (atomic) If set, allows the input to be outside the min range.
    @attribute [allowoutsidemax] (atomic) If set, allows the input to be outside the max range.
    @attribute [integeronly] (atomic) If set, only integer values are allowed.
    @attribute [oninput] (riot function) Callback function for input event. It is called with an object with only the target property.
    @attribute [onchange] (riot function) Callback function for change event. It is called with an object with only the target property.

number-input
    input(
        type="text" pattern="{integeronly ? '[0-9]*' : '[0-9.-]*'}"
        value="{ rawValue }"
        oninput="{ onInput }" onchange="{ onChange }" onwheel="{ onWheel }" onkeydown="{ onKeyDown }"
        disabled="{ opts.disabled }"
        class="{ invalid: getIsInvalid() }"
        ref="input"
    )
    input(
        type="number" value="{ value }"
        ref="hiddenInput"
    )
    .anActionableButton.number-input-anIncreaseButton(onclick="{ increase }")
        svg.feather
            use(xlink:href="#chevron-up")
    .anActionableButton.number-input-aDecreaseButton(onclick="{ decrease }")
        svg.feather
            use(xlink:href="#chevron-down")

    script.
        const initialNum = parseFloat(this.opts.value ?? this.opts.riotValue);
        this.value = isNaN(initialNum) ? 0 : initialNum; // numeric, clamped, goes to parents
        this.rawValue = String(this.value); // displayed string, used for intermediate input
        this.on('before-mount', () => {
            const initialNum = parseFloat(this.opts.value ?? this.opts.riotValue);
            this.value = isNaN(initialNum) ? 0 : initialNum;
            this.rawValue = String(this.value);
        });
        // Sync with parent's `value` attribute
        this.on('update', () => {
            const parsedParent = parseFloat(this.opts.value ?? this.opts.riotValue);
            if (!isNaN(parsedParent) && this.value !== parsedParent) {
                // Parent changed the value → update both numeric and raw
                this.setNumericValue(parsedParent);
                this.rawValue = String(this.value);
            }
        });

        const step = parseFloat(this.opts.step);
        const safeStep = isNaN(step) ? 1 : step;

        const clampValue = (num, forceClamp) => {
            const min = parseFloat(this.opts.min);
            const max = parseFloat(this.opts.max);
            let clamped = num;

            if ((!this.opts.allowoutsidemin || forceClamp) && !isNaN(min)) {
                clamped = Math.max(clamped, min);
            }
            if ((!this.opts.allowoutsidemax || forceClamp) && !isNaN(max)) {
                clamped = Math.min(clamped, max);
            }
            return clamped;
        };

        /**
         * @returns {boolean} `true` if the value was successfully set, `false` otherwise.
         */
        this.setNumericValue = (num) => {
            const prevVal = this.value;
            if (this.opts.integeronly) {
                num = Math.round(num);
            }
            num = clampValue(num);
            if (isNaN(num)) {
                return false;
            }

            this.value = num;
            this.rawValue = String(this.value);
            // Sync hidden input's value immediately
            this.refs.hiddenInput.value = num;

            if (prevVal !== num) {
                return true;
            }
            return false;
        };

        this.onInput = (e) => {
            e.stopPropagation();
            // 1. Filter out any non‑allowed characters
            let filtered = e.target.value.replace(this.opts.integeronly ? /[^\d-]/g : /[^\d.-]/g, '');

            // Prevent multiple minus signs or dots in wrong places
            const parts = filtered.split('.');
            if (parts.length > 2) {
                filtered = parts[0] + '.' + parts.slice(1).join('');
            }
            if ((filtered.match(/-/g) || []).length > 1) {
                filtered = filtered.replace(/-/g, '-');
            }

            // 2. Update the displayed raw string
            this.rawValue = filtered;
            this.refs.input.value = filtered;

            // 3. Bail out on incomplete input
            if (filtered === '' || filtered === '-' || filtered === '.' || filtered.endsWith('.')) {
                // Incomplete number – keep old numeric value, but still valid to type in
                return;
            }
            // 4. Try to parse a valid number
            const parsed = parseFloat(filtered);
            if (!isNaN(parsed)) {
                // New & valid number → update numeric value
                if (this.setNumericValue(parsed) && this.opts.oninput) {
                    this.opts.oninput({
                        target: this.refs.hiddenInput
                    });
                    // Mimic the behavior of regular HTML tags
                    // (riot.js calls an update automatically on html events)
                    this.parent.update();
                }
            }
        };

        this.onChange = (e) => {
            e.stopPropagation();
            if (!this.refs.hiddenInput) {
                // The tag can be removed right after onInput, skip onChange event in this case
                return;
            }
            // Parse the current raw string
            const filtered = e.target.value.replace(this.opts.integeronly ? /[^\d-]/g : /[^\d.-]/g, '');
            if (filtered === '' || filtered === '-' || filtered === '.' || filtered.endsWith('.')) {
                // Empty / incomplete → revert to last valid numeric value
                this.rawValue = String(this.value);
                this.refs.input.value = this.rawValue;
            } else {
                const parsed = parseFloat(filtered);
                if (!isNaN(parsed)) {
                    const finalNum = clampValue(parsed);
                    if (this.setNumericValue(finalNum) && this.opts.onchange) {
                        this.opts.onchange({
                            target: this.refs.hiddenInput
                        });
                        // Mimic the behavior of regular HTML tags
                        // (riot.js calls an update automatically on html events)
                        this.parent.update();
                    }
                } else {
                    // Should never happen, but fallback
                    this.rawValue = String(this.value);
                    this.refs.input.value = this.rawValue;
                }
            }
        };

        // Step increase/decrease on scroll and when using UI/keyboard arrows
        this.increase = () => {
            let newVal = this.value + safeStep;
            if (safeStep < 1) {
                // Eliminate possible rounding error due to working with floating-point numbers
                const magnitude = 1 / (safeStep || 1);
                newVal = Math.round(newVal * magnitude) / magnitude;
            }
            if (this.setNumericValue(clampValue(newVal, true))) {
                this.opts.oninput?.({
                    target: this.refs.hiddenInput
                });
                this.opts.onchange?.({
                    target: this.refs.hiddenInput
                });
                if (this.opts.onchange || this.opts.oninput) {
                    this.parent.update();
                }
            }
        };
        this.decrease = () => {
            let newVal = this.value - safeStep;
            if (safeStep < 1) {
                // Eliminate possible rounding error due to working with floating-point numbers
                const magnitude = 1 / (safeStep || 1);
                newVal = Math.round(newVal * magnitude) / magnitude;
            }
            if (this.setNumericValue(clampValue(newVal, true))) {
                this.opts.oninput?.({
                    target: this.refs.hiddenInput
                });
                this.opts.onchange?.({
                    target: this.refs.hiddenInput
                });
                if (this.opts.onchange || this.opts.oninput) {
                    this.parent.update();
                }
            }
        };

        this.onWheel = (e) => {
            e.preventDefault();
            if (e.deltaY > 0) {
                this.decrease();
            } else {
                this.increase();
            }
        };
        this.onKeyDown = (e) => {
            if (e.key === 'ArrowUp') {
                this.increase();
            } else if (e.key === 'ArrowDown') {
                this.decrease();
            }
        };

        this.getIsInvalid = () => {
            // 1. Check if the raw string is an incomplete / invalid number
            if (this.rawValue === '' ||
                this.rawValue === '-' ||
                this.rawValue === '.' ||
                this.rawValue.endsWith('.')
            ) {
                return true; // incomplete number
            }
            const parsed = parseFloat(this.rawValue);
            if (isNaN(parsed)) {
                return true; // truly invalid characters remain
            }

            // 2. Check numeric bounds if disallowed
            const min = parseFloat(this.opts.min);
            const max = parseFloat(this.opts.max);
            if (!this.opts.allowoutsidemin && !isNaN(min) && this.value < min) {
                return true;
            }
            if (!this.opts.allowoutsidemax && !isNaN(max) && this.value > max) {
                return true;
            }

            return false;
        };
