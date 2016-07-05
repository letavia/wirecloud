/*
 *     Copyright (c) 2015-2016 CoNWeT Lab., Universidad Politécnica de Madrid
 *
 *     This file is part of Wirecloud Platform.
 *
 *     Wirecloud Platform is free software: you can redistribute it and/or
 *     modify it under the terms of the GNU Affero General Public License as
 *     published by the Free Software Foundation, either version 3 of the
 *     License, or (at your option) any later version.
 *
 *     Wirecloud is distributed in the hope that it will be useful, but WITHOUT
 *     ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 *     FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public
 *     License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with Wirecloud Platform.  If not, see
 *     <http://www.gnu.org/licenses/>.
 *
 */

/* global gettext, StyledElements, Wirecloud */


(function (ns, se, utils) {

    "use strict";

    // ==================================================================================
    // CLASS DEFINITION
    // ==================================================================================

    /**
     * Create a new instance of class Component.
     * @extends StyledElements.Panel
     *
     * @constructor
     * @param {Operator|Widget} wiringComponent
     *      [TODO: description]
     */
    ns.Component = utils.defineClass({

        constructor: function Component(wiringComponent) {
            var used = false;

            this.title_tooltip = new se.Tooltip({content: wiringComponent.title, placement: ["top", "bottom", "right", "left"]});

            this.btnPrefs = new se.PopupButton({
                extraClass: "we-prefs-btn",
                title: gettext("Preferences"),
                iconClass: "icon-reorder"
            });
            this.btnPrefs.popup_menu.append(new ns.ComponentPrefs(this));

            this.superClass({
                state: null,
                extraClass: "we-component component-" + wiringComponent.meta.type,
                title: wiringComponent.title,
                subtitle: "v" + wiringComponent.meta.version,
                selectable: true,
                noBody: true,
                buttons: [this.btnPrefs]
            });

            this.heading.title.addClassName('component-title text-truncate');
            this.heading.subtitle.addClassName("component-version");

            this.label = document.createElement('span');

            this._component = wiringComponent;

            Object.defineProperties(this, {
                id: {value: wiringComponent.id},
                type: {value: wiringComponent.meta.type},
                used: {
                    get: function () {
                        return used;
                    },
                    set: function (value) {
                        used = value;
                        update_enable_status.call(this);
                        update_component_label.call(this);
                    }
                }
            });
            this.get().setAttribute('data-id', this.id);

            if (this.type == 'widget') {
                wiringComponent.addEventListener('title_changed', component_onrename.bind(this));
            }

            wiringComponent.addEventListener('upgraded', function (component) {
                this.setTitle(component.title);
                this.setSubtitle("v" + component.meta.version);

                update_enable_status.call(this);
                update_component_label.call(this);
            }.bind(this));
            update_enable_status.call(this);
            update_component_label.call(this);
        },

        inherit: se.Panel,

        members: {

            hasSettings: function hasSettings() {
                return this._component.meta.preferenceList.length > 0;
            },

            /**
             * @override
             */
            setTitle: function setTitle(title) {
                var span;

                span = document.createElement('span');
                span.textContent = title;
                this.title_tooltip.options.content = title;
                this.title_tooltip.bind(span);

                return this.superMember(se.Panel, 'setTitle', span);
            },

            showLogs: function showLogs() {

                this._component.showLogs();

                return this;
            },

            showSettings: function showSettings() {

                this._component.showSettings();

                return this;
            }

        }

    });

    // ==================================================================================
    // PRIVATE MEMBERS
    // ==================================================================================

    var update_component_label = function update_component_label() {
        /*jshint validthis:true */

        if (this._component.volatile) {
            this.label.textContent = utils.gettext("volatile");
            this.label.className = "label label-info";
        } else if (this._component.missing) {
            this.label.textContent = utils.gettext("missing");
            this.label.className = "label label-danger";
        } else if (this.used) {
            this.label.textContent = utils.gettext("in use");
            this.label.className = "label label-success";
        } else if (!this._component.hasEndpoints()) {
            this.label.textContent = utils.gettext("no endpoints");
            this.label.className = "label label-warning";
        } else {
            if (this.label.parentElement) {
                this.heading.removeChild(this.label);
            }
            return this;
        }
        this.heading.appendChild(this.label);

        return this;
    };

    var update_enable_status = function update_enable_status() {
        this.enabled = !(this.used || this._component.volatile || this._component.missing || !this._component.hasEndpoints());
    };

    var component_onrename = function component_onrename(title) {
        this.setTitle(title);
        this.title_tooltip.options.content = title;
    };

})(Wirecloud.ui.WiringEditor, StyledElements, StyledElements.Utils);
