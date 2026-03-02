/**
 * Simple Tooltip Library for TypeScript – CSS‑driven styling
 *
 * Features:
 * - Mount/unmount on any container.
 * - Reads `data-tooltip` (markdown) and renders it via a user‑provided function.
 * - Shows the deepest tooltip when elements are nested.
 * - Smoothly transitions between elements (updates content/position on every mousemove).
 * - Configurable show delay (default 500ms) before the tooltip appears.
 * - Configurable hide delay (default 250ms) after the mouse leaves the element/tooltip.
 * - Hoverable tooltip – the tooltip itself can be hovered (e.g., to scroll) without disappearing.
 * - Fades in/out with CSS transitions (controlled by class `tooltip--visible`).
 * - Positions left/right (default) or above/below (if `data-tooltip-position="vertical"`).
 * - Triangular pointer (`.tooltip__pointer`) always points to the hovered element.
 * - Stays inside the viewport, with scrollable content and max‑height (set in CSS).
 */

interface TooltipOptions {
    /** The container element that holds all tooltip‑enabled elements. */
    container: HTMLElement;
    /**
     * Function that receives the markdown string from `data-tooltip`
     * and returns either an HTML string or an HTMLElement to be inserted.
     */
    renderMarkdown: (markdown: string) => string | HTMLElement;
    /** Delay before showing the tooltip (ms). Default: 500. */
    showDelay?: number;
    /** Delay before hiding the tooltip (ms). Default: 250. */
    hideDelay?: number;
}

export class TooltipManager {
    private options: Required<TooltipOptions>;
    private tooltipEl: HTMLElement;
    private contentEl: HTMLElement;
    private pointerEl: HTMLElement;
    private activeElement: HTMLElement | null = null;
    private showTimer: number | null = null;
    private hideTimer: number | null = null;
    private isVisible = false;

    // Bound event handlers
    private onMouseMove = (e: MouseEvent) => this.handleMouseMove(e);
    private onWindowScroll = () => this.repositionIfActive();
    private onWindowResize = () => this.repositionIfActive();

    constructor(options: TooltipOptions) {
        this.options = {
            showDelay: 500,
            hideDelay: 250,
            ...options
        };
        this.createTooltipElement();
    }

    /** Attaches event listeners to the document and window. */
    mount() {
        document.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('scroll', this.onWindowScroll, true);
        window.addEventListener('resize', this.onWindowResize);
    }

    /** Detaches event listeners and removes the tooltip from the DOM. */
    unmount() {
        document.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('scroll', this.onWindowScroll, true);
        window.removeEventListener('resize', this.onWindowResize);

        this.hideImmediately();
        if (this.tooltipEl.parentNode) {
            this.tooltipEl.parentNode.removeChild(this.tooltipEl);
        }
    }

    // -------------------------------------------------------------------------
    // Private implementation
    // -------------------------------------------------------------------------

    private createTooltipElement() {
        this.tooltipEl = document.createElement('div');
        this.tooltipEl.className = 'tooltip';
        this.tooltipEl.setAttribute('role', 'tooltip');

        this.pointerEl = document.createElement('div');
        this.pointerEl.className = 'tooltip__pointer';
        this.tooltipEl.appendChild(this.pointerEl);

        this.contentEl = document.createElement('div');
        this.contentEl.className = 'tooltip__content';
        this.tooltipEl.appendChild(this.contentEl);

        document.body.appendChild(this.tooltipEl);
    }

    /** Checks if the mouse is currently over the tooltip itself. */
    private isMouseOverTooltip(x: number, y: number): boolean {
        const elements = document.elementsFromPoint(x, y);
        return elements.includes(this.tooltipEl);
    }

    /** Finds the deepest element with data-tooltip under the mouse. */
    private getDeepestTooltipElement(x: number, y: number): HTMLElement | null {
        const elements = document.elementsFromPoint(x, y);
        for (const el of elements) {
            if (
                el instanceof HTMLElement &&
                el.hasAttribute('data-tooltip') &&
                this.options.container.contains(el)
            ) {
                return el;
            }
        }
        return null;
    }

    private updateContent(tooltipTag: HTMLElement) {
        const markdown = tooltipTag.getAttribute('data-tooltip') || '';
        const rendered = this.options.renderMarkdown(markdown);
        if (typeof rendered === 'string') {
            this.contentEl.innerHTML = rendered;
        } else {
            this.contentEl.innerHTML = '';
            this.contentEl.appendChild(rendered);
        }
    }

    private positionTooltip(target: HTMLElement) {
        const targetRect = target.getBoundingClientRect();
        const tooltipRect = this.tooltipEl.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const padding = 5;
        const gap = 10; // space between target and tooltip

        // Determine positioning mode from attribute
        const positionAttr = target.getAttribute('data-tooltip-position');
        const isVertical = positionAttr === 'vertical';

        // Remove all placement classes first
        this.tooltipEl.classList.remove('tooltip--left', 'tooltip--right', 'tooltip--above', 'tooltip--below');

        if (isVertical) {
            // ----- VERTICAL (above/below) -----
            // Try to place above first
            let placeAbove = true;
            let top = targetRect.top - tooltipRect.height - gap;
            if (top < padding) {
                // Not enough space above, try below
                placeAbove = false;
                top = targetRect.bottom + gap;
            }
            // If below also exceeds, clamp to padding
            if (top + tooltipRect.height > viewportHeight - padding) {
                top = viewportHeight - tooltipRect.height - padding;
            }

            // Horizontal centering
            let left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
            left = Math.max(padding, Math.min(left, viewportWidth - tooltipRect.width - padding));

            // Apply placement class
            this.tooltipEl.classList.add(placeAbove ? 'tooltip--above' : 'tooltip--below');

            // Set position
            if (isFinite(left)) {
                this.tooltipEl.style.left = left + 'px';
            }
            if (isFinite(top)) {
                this.tooltipEl.style.top = top + 'px';
            }

            // Position pointer: horizontally aligned with target center
            const targetCenterX = targetRect.left + targetRect.width / 2;
            const pointerLeft = targetCenterX - left - 6; // 6px = half pointer width (approx)
            const minPointerLeft = 6;
            const maxPointerLeft = tooltipRect.width - 6;
            const clampedPointerLeft = Math.min(
                maxPointerLeft,
                Math.max(minPointerLeft, pointerLeft)
            );
            this.pointerEl.style.left = clampedPointerLeft + 'px';
            // Reset any previously set top (from horizontal mode)
            this.pointerEl.style.top = '';
        } else {
            // ----- HORIZONTAL (left/right) -----
            const targetCenterX = targetRect.left + targetRect.width / 2;
            const placeLeft = targetCenterX > viewportWidth / 2;

            this.tooltipEl.classList.add(placeLeft ? 'tooltip--left' : 'tooltip--right');

            let top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
            top = Math.max(padding, Math.min(top, viewportHeight - tooltipRect.height - padding));

            let left: number;
            if (placeLeft) {
                left = targetRect.left - tooltipRect.width - gap;
                if (left < padding) {
                    left = padding;
                }
            } else {
                left = targetRect.right + gap;
                if (left + tooltipRect.width > viewportWidth - padding) {
                    left = viewportWidth - tooltipRect.width - padding;
                }
            }

            if (isFinite(left)) {
                this.tooltipEl.style.left = left + 'px';
            }
            if (isFinite(top)) {
                this.tooltipEl.style.top = top + 'px';
            }

            // Position pointer: vertically aligned with target center
            const targetCenterY = targetRect.top + targetRect.height / 2;
            const pointerTop = targetCenterY - top - 6;
            const minPointerTop = 6;
            const maxPointerTop = tooltipRect.height - 6;
            const clampedPointerTop = Math.min(maxPointerTop, Math.max(minPointerTop, pointerTop));
            this.pointerEl.style.top = clampedPointerTop + 'px';
            // Reset left (from vertical mode)
            this.pointerEl.style.left = '';
        }
    }

    private show() {
        if (!this.isVisible) {
            this.isVisible = true;
            this.tooltipEl.classList.add('tooltip--visible');
        }
    }

    private hide() {
        if (this.isVisible) {
            this.isVisible = false;
            this.tooltipEl.classList.remove('tooltip--visible');
        }
    }

    private hideImmediately() {
        if (this.hideTimer) {
            clearTimeout(this.hideTimer);
            this.hideTimer = null;
        }
        if (this.showTimer) {
            clearTimeout(this.showTimer);
            this.showTimer = null;
        }
        this.hide();
        this.activeElement = null;
    }

    private startShowTimer() {
        if (this.showTimer) {
            clearTimeout(this.showTimer);
        }
        this.showTimer = window.setTimeout(() => {
            if (this.activeElement) {
                this.show();
                this.positionTooltip(this.activeElement);
            }
            this.showTimer = null;
        }, this.options.showDelay);
    }

    private startHideTimer() {
        if (this.hideTimer) {
            clearTimeout(this.hideTimer);
        }
        this.hideTimer = window.setTimeout(() => {
            this.hide();
            this.activeElement = null;
            this.hideTimer = null;
        }, this.options.hideDelay);
    }

    /** Called on every mousemove anywhere on the page. */
    private handleMouseMove(e: MouseEvent) {
        // If the mouse is over the tooltip, keep it visible and cancel any hide timer
        if (this.isMouseOverTooltip(e.clientX, e.clientY)) {
            if (this.hideTimer) {
                clearTimeout(this.hideTimer);
                this.hideTimer = null;
            }
            return;
        }

        const deepest = this.getDeepestTooltipElement(e.clientX, e.clientY);

        if (deepest) {
            // Cancel hide timer – we are over a tooltip element
            if (this.hideTimer) {
                clearTimeout(this.hideTimer);
                this.hideTimer = null;
            }

            if (this.activeElement !== deepest) {
                // New element – cancel any pending show timer and start fresh
                if (this.showTimer) {
                    clearTimeout(this.showTimer);
                    this.showTimer = null;
                }

                this.activeElement = deepest;
                this.updateContent(deepest);

                if (this.isVisible) {
                    // Already visible: update position immediately
                    this.positionTooltip(deepest);
                } else {
                    // Not visible: start the show delay
                    this.startShowTimer();
                }
            } else if (this.isVisible) {
                // Same element – just reposition (show timer, if running, continues)
                this.positionTooltip(deepest);
            }
            // If not visible, we rely on the already running show timer
        } else {
            // No tooltip element under mouse → start hide timer and cancel show timer
            if (this.activeElement) {
                this.startHideTimer();
            }
            if (this.showTimer) {
                clearTimeout(this.showTimer);
                this.showTimer = null;
            }
        }
    }

    private repositionIfActive() {
        if (this.activeElement && this.isVisible) {
            this.positionTooltip(this.activeElement);
        }
    }
}
