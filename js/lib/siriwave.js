(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.SiriWave = factory());
}(this, (function () { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }

    var ClassicCurve = /** @class */ (function () {
        function ClassicCurve(ctrl, definition) {
            this.ATT_FACTOR = 4;
            this.GRAPH_X = 2;
            this.AMPLITUDE_FACTOR = 0.6;
            this.ctrl = ctrl;
            this.definition = definition;
        }
        ClassicCurve.prototype.globalAttFn = function (x) {
            return Math.pow(this.ATT_FACTOR / (this.ATT_FACTOR + Math.pow(x, this.ATT_FACTOR)), this.ATT_FACTOR);
        };
        ClassicCurve.prototype.xPos = function (i) {
            return this.ctrl.width * ((i + this.GRAPH_X) / (this.GRAPH_X * 2));
        };
        ClassicCurve.prototype.yPos = function (i) {
            return (this.AMPLITUDE_FACTOR *
                (this.globalAttFn(i) *
                    (this.ctrl.heightMax * this.ctrl.amplitude) *
                    (1 / this.definition.attenuation) *
                    Math.sin(this.ctrl.opt.frequency * i - this.ctrl.phase)));
        };
        ClassicCurve.prototype.draw = function () {
            var ctx = this.ctrl.ctx;
            ctx.moveTo(0, 0);
            ctx.beginPath();
            var color = this.ctrl.color.replace(/rgb\(/g, "").replace(/\)/g, "");
            ctx.strokeStyle = "rgba(" + color + "," + this.definition.opacity + ")";
            ctx.lineWidth = this.definition.lineWidth;
            // Cycle the graph from -X to +X every PX_DEPTH and draw the line
            for (var i = -this.GRAPH_X; i <= this.GRAPH_X; i += this.ctrl.opt.pixelDepth) {
                ctx.lineTo(this.xPos(i), this.ctrl.heightMax + this.yPos(i));
            }
            ctx.stroke();
        };
        ClassicCurve.getDefinition = function () {
            return [
                {
                    attenuation: -2,
                    lineWidth: 1,
                    opacity: 0.1,
                },
                {
                    attenuation: -6,
                    lineWidth: 1,
                    opacity: 0.2,
                },
                {
                    attenuation: 4,
                    lineWidth: 1,
                    opacity: 0.4,
                },
                {
                    attenuation: 2,
                    lineWidth: 1,
                    opacity: 0.6,
                },
                {
                    attenuation: 1,
                    lineWidth: 1.5,
                    opacity: 1,
                },
            ];
        };
        return ClassicCurve;
    }());

    var SiriWave = /** @class */ (function () {
        function SiriWave(_a) {
            var _this = this;
            var container = _a.container, rest = __rest(_a, ["container"]);
            // Phase of the wave (passed to Math.sin function)
            this.phase = 0;
            // Boolean value indicating the the animation is running
            this.run = false;
            // Curves objects to animate
            this.curves = [];
            var csStyle = window.getComputedStyle(container);
            this.opt = __assign({ container: container, style: "ios", ratio: window.devicePixelRatio || 1, speed: 0.2, amplitude: 1, frequency: 6, color: "#fff", cover: false, width: parseInt(csStyle.width.replace("px", ""), 10), height: parseInt(csStyle.height.replace("px", ""), 10), autostart: true, pixelDepth: 0.02, lerpSpeed: 0.1 }, rest);
            /**
             * Actual speed of the animation. Is not safe to change this value directly, use `setSpeed` instead.
             */
            this.speed = Number(this.opt.speed);
            /**
             * Actual amplitude of the animation. Is not safe to change this value directly, use `setAmplitude` instead.
             */
            this.amplitude = Number(this.opt.amplitude);
            /**
             * Width of the canvas multiplied by pixel ratio
             */
            this.width = Number(this.opt.ratio * this.opt.width);
            /**
             * Height of the canvas multiplied by pixel ratio
             */
            this.height = Number(this.opt.ratio * this.opt.height);
            /**
             * Maximum height for a single wave
             */
            this.heightMax = Number(this.height / 2) - 6;
            /**
             * Color of the wave (used in Classic iOS)
             */
            this.color = "rgb(" + this.hex2rgb(this.opt.color) + ")";
            /**
             * An object containing controller variables that need to be interpolated
             * to an another value before to be actually changed
             */
            this.interpolation = {
                speed: this.speed,
                amplitude: this.amplitude,
            };
            /**
             * Canvas DOM Element where curves will be drawn
             */
            this.canvas = document.createElement("canvas");
            /**
             * 2D Context from Canvas
             */
            var ctx = this.canvas.getContext("2d");
            if (ctx === null) {
                throw new Error("Unable to create 2D Context");
            }
            this.ctx = ctx;
            // Set dimensions
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            // By covering, we ensure the canvas is in the same size of the parent
            if (this.opt.cover === true) {
                this.canvas.style.width = this.canvas.style.height = "100%";
            }
            else {
                this.canvas.style.width = this.width / this.opt.ratio + "px";
                this.canvas.style.height = this.height / this.opt.ratio + "px";
            }
            // Instantiate all curves based on the style
            this.curves = (this.opt.curveDefinition || ClassicCurve.getDefinition()).map(function (def) { return new ClassicCurve(_this, def); });
            // Attach to the container
            this.opt.container.appendChild(this.canvas);
            // Start the animation
            if (this.opt.autostart) {
                this.start();
            }
        }
        /**
         * Convert an HEX color to RGB
         */
        SiriWave.prototype.hex2rgb = function (hex) {
            var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
            hex = hex.replace(shorthandRegex, function (m, r, g, b) { return r + r + g + g + b + b; });
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result
                ? parseInt(result[1], 16).toString() + "," + parseInt(result[2], 16).toString() + "," + parseInt(result[3], 16).toString()
                : null;
        };
        SiriWave.prototype.intLerp = function (v0, v1, t) {
            return v0 * (1 - t) + v1 * t;
        };
        /**
         * Interpolate a property to the value found in this.interpolation
         */
        SiriWave.prototype.lerp = function (propertyStr) {
            var prop = this.interpolation[propertyStr];
            if (prop !== null) {
                this[propertyStr] = this.intLerp(this[propertyStr], prop, this.opt.lerpSpeed);
                if (this[propertyStr] - prop === 0) {
                    this.interpolation[propertyStr] = null;
                }
            }
            return this[propertyStr];
        };
        /**
         * Clear the canvas
         */
        SiriWave.prototype.clear = function () {
            this.ctx.globalCompositeOperation = "destination-out";
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.globalCompositeOperation = "source-over";
        };
        /**
         * Draw all curves
         */
        SiriWave.prototype.draw = function () {
            this.curves.forEach(function (curve) { return curve.draw(); });
        };
        /**
         * Clear the space, interpolate values, calculate new steps and draws
         * @returns
         */
        SiriWave.prototype.startDrawCycle = function () {
            this.clear();
            // Interpolate values
            this.lerp("amplitude");
            this.lerp("speed");
            this.draw();
            this.phase = (this.phase + (Math.PI / 2) * this.speed) % (2 * Math.PI);
            if (window.requestAnimationFrame) {
                this.animationFrameId = window.requestAnimationFrame(this.startDrawCycle.bind(this));
            }
            else {
                this.timeoutId = setTimeout(this.startDrawCycle.bind(this), 20);
            }
        };
        /* API */
        /**
         * Start the animation
         */
        SiriWave.prototype.start = function () {
            if (!this.canvas) {
                throw new Error("This instance of SiriWave has been disposed, please create a new instance");
            }
            this.phase = 0;
            // Ensure we don't re-launch the draw cycle
            if (!this.run) {
                this.run = true;
                this.startDrawCycle();
            }
        };
        /**
         * Stop the animation
         */
        SiriWave.prototype.stop = function () {
            this.phase = 0;
            this.run = false;
            // Clear old draw cycle on stop
            if (this.animationFrameId) {
                window.cancelAnimationFrame(this.animationFrameId);
            }
            if (this.timeoutId) {
                clearTimeout(this.timeoutId);
            }
        };
        /**
         * Dispose
         */
        SiriWave.prototype.dispose = function () {
            this.stop();
            if (this.canvas) {
                this.canvas.remove();
                this.canvas = null;
            }
        };
        /**
         * Set a new value for a property (interpolated)
         */
        SiriWave.prototype.set = function (propertyStr, value) {
            this.interpolation[propertyStr] = value;
        };
        /**
         * Set a new value for the speed property (interpolated)
         */
        SiriWave.prototype.setSpeed = function (value) {
            this.set("speed", value);
        };
        /**
         * Set a new value for the amplitude property (interpolated)
         */
        SiriWave.prototype.setAmplitude = function (value) {
            this.set("amplitude", value);
        };
        return SiriWave;
    }());

    return SiriWave;

})));