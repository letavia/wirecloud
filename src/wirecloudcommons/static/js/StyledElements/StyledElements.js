/*---------------------------------------------------------------------------*
 *                               StyledElements                              *
 *---------------------------------------------------------------------------*/

// Static class
var StyledElements = new Object();

/**
 * Esta clase se encarga de gestionar los eventos que van a manejar los
 * <code>StyledElement</code>s.
 */
StyledElements.Event = function() {
    this.handlers = [];
};

StyledElements.Event.prototype.addEventListener = function(handler) {
    this.handlers.push(handler);
};

StyledElements.Event.prototype.removeEventListener = function(handler) {
    var index = this.handlers.indexOf(handler);
    if (index != -1) {
        this.handlers.splice(index, 1);
    }
};

StyledElements.Event.prototype.dispatch = function() {
    for (var i = 0; i < this.handlers.length; i++) {
        try {
            this.handlers[i].apply(null, arguments);
        } catch (e) {}
    }
};


/**
 * @abstract
 */
StyledElements.ObjectWithEvents = function(events) {
    events = events ? events : [];

    this.events = {};
    for (var i = 0; i < events.length; i++) {
        this.events[events[i]] = new StyledElements.Event();
    }
}

/**
 * Añade un listener para un evento indicado.
 */
StyledElements.ObjectWithEvents.prototype.addEventListener = function(event, handler) {
    if (this.events[event] === undefined)
        throw new Error(EzWebExt.interpolate("Unhandled event \"%(event)s\"", {event: event}));

    this.events[event].addEventListener(handler);
}

/**
 * Elimina un listener para un evento indicado.
 */
StyledElements.ObjectWithEvents.prototype.removeEventListener = function(event, handler) {
    if (this.events[event] === undefined)
        throw new Error(EzWebExt.interpolate("Unhandled event \"%(event)s\"", {event: event}));

    this.events[event].removeEventListener(handler);
}

/**
 * Unsets some internal structures to avoid memory leaks caused by circular
 * references.
 */
StyledElements.ObjectWithEvents.prototype.destroy = function() {
    this.events = null;
}

/**
 * @abstract
 */
StyledElements.StyledElement = function(events) {
    StyledElements.ObjectWithEvents.call(this, events);
    this.wrapperElement = null;
    this.enabled = true;
}
StyledElements.StyledElement.prototype = new StyledElements.ObjectWithEvents();

/**
 * Inserta el elemento con estilo dentro del elemento indicado.
 *
 * @param element Este será el elemento donde se insertará el elemento con
 * estilo.
 * @param refElement Este parámetro es opcional. En caso de ser usado, sirve
 * para indicar delante de que elemento se tiene que añadir este elemento con
 * estilo.
 */
StyledElements.StyledElement.prototype.insertInto = function (element, refElement) {
    if (element instanceof StyledElements.StyledElement) {
        element = element.wrapperElement;
    }

    if (refElement instanceof StyledElements.StyledElement) {
        refElement = refElement.wrapperElement;
    }

    if (refElement)
        element.insertBefore(this.wrapperElement, refElement);
    else
        element.appendChild(this.wrapperElement);
}

/**
 * @private
 */
StyledElements.StyledElement.prototype._getUsableHeight = function() {
    var parentElement = this.wrapperElement.parentNode;
    if (!EzWebExt.XML.isElement(parentElement))
        return null;

    var parentStyle = document.defaultView.getComputedStyle(parentElement, null);
    var containerStyle = document.defaultView.getComputedStyle(this.wrapperElement, null);

    var height = parentElement.offsetHeight -
                 parentStyle.getPropertyCSSValue('padding-top').getFloatValue(CSSPrimitiveValue.CSS_PX) -
                 parentStyle.getPropertyCSSValue('padding-bottom').getFloatValue(CSSPrimitiveValue.CSS_PX) -
                 containerStyle.getPropertyCSSValue('padding-top').getFloatValue(CSSPrimitiveValue.CSS_PX) -
                 containerStyle.getPropertyCSSValue('padding-bottom').getFloatValue(CSSPrimitiveValue.CSS_PX) -
                 containerStyle.getPropertyCSSValue('border-top-width').getFloatValue(CSSPrimitiveValue.CSS_PX) -
                 containerStyle.getPropertyCSSValue('border-bottom-width').getFloatValue(CSSPrimitiveValue.CSS_PX) -
                 containerStyle.getPropertyCSSValue('margin-top').getFloatValue(CSSPrimitiveValue.CSS_PX) -
                 containerStyle.getPropertyCSSValue('margin-bottom').getFloatValue(CSSPrimitiveValue.CSS_PX);

    return height;
}

/**
 * @private
 */
StyledElements.StyledElement.prototype._getUsableWidth = function() {
    var parentElement = this.wrapperElement.parentNode;
    if (!EzWebExt.XML.isElement(parentElement))
        return null;

    var parentStyle = document.defaultView.getComputedStyle(parentElement, null);
    var containerStyle = document.defaultView.getComputedStyle(this.wrapperElement, null);

    var width = parentElement.offsetWidth -
                parentStyle.getPropertyCSSValue('padding-left').getFloatValue(CSSPrimitiveValue.CSS_PX) -
                parentStyle.getPropertyCSSValue('padding-right').getFloatValue(CSSPrimitiveValue.CSS_PX) -
                containerStyle.getPropertyCSSValue('padding-left').getFloatValue(CSSPrimitiveValue.CSS_PX) -
                containerStyle.getPropertyCSSValue('padding-right').getFloatValue(CSSPrimitiveValue.CSS_PX);

    return width;
}

/**
 * Esta función sirve para repintar el componente.
 *
 * @param {Boolean} temporal Indica si se quiere repintar el componente de
 * forma temporal o de forma permanente. Por ejemplo, cuando mientras se está
 * moviendo el tirador de un HPaned se llama a esta función con el parámetro
 * temporal a <code>true</code>, permitiendo que los componentes intenten hacer
 * un repintado más rápido (mejorando la experiencia del usuario); y cuando el
 * usuario suelta el botón del ratón se ejecuta una última vez esta función con
 * el parámetro temporal a <code>false</code>, indicando que el usuario ha
 * terminado de mover el tirador y que se puede llevar a cabo un repintado más
 * inteligente. Valor por defecto: <code>false</code>.
 */
StyledElements.StyledElement.prototype.repaint = function (temporal) {
}

/**
 *
 */
StyledElements.StyledElement.prototype.hasClassName = function(className) {
    return EzWebExt.hasClassName(this.wrapperElement, className);
}

/**
 *
 */
StyledElements.StyledElement.prototype.addClassName = function(className) {
    EzWebExt.addClassName(this.wrapperElement, className);
}

/**
 *
 */
StyledElements.StyledElement.prototype.removeClassName = function(className) {
    EzWebExt.removeClassName(this.wrapperElement, className);
}

StyledElements.StyledElement.prototype.setDisabled = function(disable) {
    if (disable) {
        this.disable();
    } else {
        this.enable();
    }
}

/**
 * Rehabilita el componente quitándole la clase css .disabled
 */
StyledElements.StyledElement.prototype.enable = function() {
    this.enabled = true;
    this.removeClassName('disabled');
}

/**
 * Deshabilita el componente añadiendo la clase css .disabled
 */
StyledElements.StyledElement.prototype.disable = function() {
    this.enabled = false;
    this.addClassName('disabled');
}

/*
 * @experimental
 */
StyledElements.StyledElement.prototype.getBoundingClientRect = function () {
    return this.wrapperElement.getBoundingClientRect();
};

/**
 * @abstract
 *
 * Esta clase contiene la lógica base de todos los elementos StyledElements que
 * corresponden con un elemento de entrada de datos valido tanto para usarlos
 * junto con formularios como sin ellos.
 */
StyledElements.StyledInputElement = function(defaultValue, events) {
    this.inputElement = null;
    this.defaultValue = defaultValue;

    StyledElements.StyledElement.call(this, events);
}
StyledElements.StyledInputElement.prototype = new StyledElements.StyledElement();

StyledElements.StyledInputElement.prototype.getValue = function () {
    return this.inputElement.value;
}

StyledElements.StyledInputElement.prototype.setValue = function (newValue) {
    this.inputElement.value = newValue;
}

StyledElements.StyledInputElement.prototype.reset = function () {
    this.setValue(this.defaultValue);
}

StyledElements.StyledInputElement.prototype.enable = function() {
    StyledElements.StyledElement.prototype.enable.call(this);
    this.inputElement.disabled = false;
}

StyledElements.StyledInputElement.prototype.disable = function() {
    StyledElements.StyledElement.prototype.disable.call(this);
    this.inputElement.disabled = true;
}

StyledElements.StyledInputElement.prototype.focus = function() {
    this.inputElement.focus();
}

/**
 * Este componente permite crear un contenedor en el que añadir otros
 * componentes.
 *
 * @param options
 * @param events
 */
StyledElements.Container = function(options, events) {
    var defaultOptions = {
        'extending': false,
        'class': '',
        'useFullHeight': false
    };
    options = EzWebExt.merge(defaultOptions, options);

    // Necesario para permitir herencia
    if (options.extending)
        return;

    StyledElements.StyledElement.call(this, events);

    this.useFullHeight = options.useFullHeight;
    this.wrapperElement = document.createElement("div");
    this.childs = new Array();

    if (options['id']) {
        this.wrapperElement.setAttribute("id", options['id']);
    }

    this.wrapperElement.className = EzWebExt.prependWord(options['class'], "container");
}
StyledElements.Container.prototype = new StyledElements.StyledElement();

StyledElements.Container.prototype.appendChild = function(element) {
    if (element instanceof StyledElements.Fragment) {
        element.insertInto(this);
    } else if (element instanceof StyledElements.StyledElement) {
        element.insertInto(this);
        this.childs.push(element);
    } else {
        this.wrapperElement.appendChild(element);
    }
}

StyledElements.Container.prototype.removeChild = function(element) {
    var index;
    if (element instanceof StyledElements.StyledElement) {
        index = this.childs.indexOf(element);
        this.childs.splice(index, 1);
        this.wrapperElement.removeChild(element.wrapperElement);
    } else {
        this.wrapperElement.removeChild(element);
    }
}

StyledElements.Container.prototype.repaint = function(temporal) {
    temporal = temporal !== undefined ? temporal : false;

    if (this.useFullHeight) {
        var height = this._getUsableHeight();
        if (height == null)
            return; // nothing to do

        this.wrapperElement.style.height = (height + "px");
    }

    for (var i = 0; i < this.childs.length; i++)
        this.childs[i].repaint(temporal);

    if (this.disabledLayer != null) {
        this.disabledLayer.style.height = this.wrapperElement.scrollHeight + 'px';
    }
}

/**
 * Elimina el contenido de este contenedor.
 */
StyledElements.Container.prototype.clear = function() {
    this.childs = new Array();
    this.wrapperElement.innerHTML = "";
    if (this.disabledLayer != null)
        this.wrapperElement.appendChild(this.disabledLayer);
}

/**
 * Devuelve <code>true</code> si este Componente está deshabilitado.
 */
StyledElements.Container.prototype.isDisabled = function() {
    return this.disabledLayer != null;
}

/**
 * Deshabilita/habilita este contenedor. Cuando un contenedor
 */
StyledElements.Container.prototype.setDisabled = function(disabled) {
    if (this.isDisabled() == disabled) {
      // Nothing to do
      return;
    }

    if (disabled) {
        this.disabledLayer = document.createElement('div');
        EzWebExt.addClassName(this.disabledLayer, 'disable-layer');
        this.wrapperElement.appendChild(this.disabledLayer);
        this.wrapperElement.addClassName('disabled');
        this.disabledLayer.style.height = this.wrapperElement.scrollHeight + 'px';
    } else {
        this.wrapperElement.removeClassName('disabled');
        EzWebExt.removeFromParent(this.disabledLayer);
        this.disabledLayer = null;
    }
    this.enabled = !disabled;
}

StyledElements.Container.prototype.enable = function() {
    this.setDisabled(false);
}

StyledElements.Container.prototype.disable = function() {
    this.setDisabled(true);
}

/**
 * Este
 */
StyledElements.StyledList = function(options) {
    options = EzWebExt.merge({
        'class':            '',
        'multivalued':      false,
        'initialEntries':   [],
        'initialSelection': []
    }, options);

    StyledElements.StyledElement.call(this, ['change']);

    this.wrapperElement = document.createElement("div");
    this.wrapperElement.className = EzWebExt.prependWord(options['class'], "styled_list");

    this.content = document.createElement("div");
    this.wrapperElement.appendChild(this.content);

    this.entries = [];
    this.entriesByValue = {};
    this.currentSelection = [];

    this.addEntries(options.initialEntries);
    this.select(options.initialSelection);

    /* Process options */
    if (options.full)
        EzWebExt.appendClassName(this.wrapperElement, "full");

    this.multivalued = options.multivalued;

    if (options.allowEmpty === undefined)
        this.allowEmpty = this.multivalued;
    else
        this.allowEmpty = options.allowEmpty;
}
StyledElements.StyledList.prototype = new StyledElements.StyledElement();

/**
 * Añade las entradas indicadas en la lista.
 */
StyledElements.StyledList.prototype.addEntries = function(entries) {
    var entryValue, entryText;

    if (entries == null || entries.length == 0)
        return;

    for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        if (entry instanceof Array) {
            entryValue = entry[0];
            entryText = entry[1];
        } else {
            entryValue = entries[i].value;
            entryText = entries[i].label;
        }
        entryText = entryText ? entryText : entryValue;

        var row = document.createElement("div");
        row.className = "row";

        var context = {listComponent: this, value: entryValue};
        EzWebExt.addEventListener(row, "click",
                             EzWebExt.bind(function() {
                                 if (this.listComponent.enabled)
                                    this.listComponent.toggleElementSelection(this.value);
                             }, context),
                             true);
        entry.element = row;

        row.appendChild(document.createTextNode(entryText));
        this.content.appendChild(row);

        this.entriesByValue[entryValue] = entry;
    }
    this.entries = this.entries.concat(entries);
}

StyledElements.StyledList.prototype.removeEntryByValue = function(value) {
    var i, entry, index;

    entry = this.entriesByValue[value];
    delete this.entriesByValue[value];
    this.entries.slice(this.entries.indexOf(entry), 1);
    EzWebExt.removeFromParent(entry.element);

    if (index !== -1) {
        this.currentSelection.splice(index, 1);
        this.events['change'].dispatch(this, this.currentSelection, [], [value]);
    }
}

/**
 * Removes all entries of this StyledList
 */
StyledElements.StyledList.prototype.clear = function () {
    this.cleanSelection();

    this.content.innerHTML = '';
    this.entries = [];
    this.entriesByValue = {};
};

/**
 * Devuelve una copia de la selección actual.
 */
StyledElements.StyledList.prototype.getSelection = function() {
    return EzWebExt.clone(this.currentSelection);
}

/**
 * @private
 */
StyledElements.StyledList.prototype._cleanSelection = function() {
    for (var i = 0; i < this.currentSelection.length; i++) {
        var value = this.currentSelection[i];
        EzWebExt.removeClassName(this.entriesByValue[value].element, "selected");
    }
    this.currentSelection = [];
}

/**
 * Borra la seleccion actual.
 */
StyledElements.StyledList.prototype.cleanSelection = function() {
    if (this.currentSelection.length === 0)
        return;  // Nothing to do

    var oldSelection = this.currentSelection;

    this._cleanSelection();

    this.events['change'].dispatch(this, [], [], oldSelection);
}

/**
 * Cambia la selección actual a la indicada.
 *
 * @param {Array} selection lista de valores a seleccionar.
 */
StyledElements.StyledList.prototype.select = function(selection) {
    this._cleanSelection();

    this.addSelection(selection);
}

/**
 * Añade un conjunto de valores a la selección actual.
 */
StyledElements.StyledList.prototype.addSelection = function(selection) {
    var i, entry, addedValues = [], removedValues = [];

    if (selection.length === 0)
        return;  // Nothing to do

    if (!this.multivalued) {
        if (selection[0] === this.currentSelection[0])
            return; // Nothing to do

        removedValues = this.currentSelection;

        this._cleanSelection();

        if (selection.length > 1)
            selection = selection.splice(0, 1);
    }

    for (i = 0; i < selection.length; i++) {
        entry = selection[i];
        if (this.currentSelection.indexOf(entry) === -1) {
            EzWebExt.appendClassName(this.entriesByValue[entry].element, "selected");
            this.currentSelection.push(entry);
            addedValues.push(entry);
        }
    }

    this.events['change'].dispatch(this, this.currentSelection, addedValues, removedValues);
}

/**
 * Elimina un conjunto de valores de la selección actual.
 */
StyledElements.StyledList.prototype.removeSelection = function(selection) {
    var i, entry, index, removedValues = [];

    if (selection.length === 0)
        return;  // Nothing to do

    for (i = 0; i < selection.length; i++) {
        entry = selection[i];
        EzWebExt.removeClassName(this.entriesByValue[entry].element, "selected");
        index = this.currentSelection.indexOf(entry);
        if (index !== -1) {
            this.currentSelection.splice(index, 1);
            EzWebExt.removeClassName(this.entriesByValue[entry].element, "selected");
            removedValues.push(entry);
        }
    }

    if (removedValues.length > 0) {
        this.events['change'].dispatch(this, this.currentSelection, [], removedValues);
    }
}

/**
 * Añade o borra una entrada de la selección dependiendo de si el elemento está
 * ya selecionado o no. En caso de que la entrada estuviese selecionado, el
 * elemento se eliminiaria de la selección y viceversa.
 */
StyledElements.StyledList.prototype.toggleElementSelection = function(element) {
    if (!EzWebExt.hasClassName(this.entriesByValue[element].element, "selected")) {
        this.addSelection([element]);
    } else if (this.allowEmpty) {
        this.removeSelection([element]);
    }
}

/**
 * Añade un campo de texto.
 */
StyledElements.StyledTextArea = function(options) {
    var defaultOptions = {
        'initialValue': '',
        'class': ''
    };
    options = EzWebExt.merge(defaultOptions, options);

    StyledElements.StyledInputElement.call(this, options.initialValue, ['change']);

    this.wrapperElement = document.createElement("div");
    this.wrapperElement.className = "styled_text_area";
    if (options['class'] !== "") {
        this.wrapperElement.className += " " + options['class'];
    };

    this.inputElement = document.createElement("textarea");

    if (options['name'])
        this.inputElement.setAttribute("name", options['name']);

    if (options['id'] != undefined)
        this.wrapperElement.setAttribute("id", options['id']);

    this.setValue(options['initialValue']);

    var div = document.createElement("div");
    div.appendChild(this.inputElement);
    this.wrapperElement.appendChild(div);

    /* Internal events */
    EzWebExt.addEventListener(this.inputElement, 'mousedown', EzWebExt.stopPropagationListener, true);
    EzWebExt.addEventListener(this.inputElement, 'click', EzWebExt.stopPropagationListener, true);
}
StyledElements.StyledTextArea.prototype = new StyledElements.StyledInputElement();

/**
 *
 */
StyledElements.StyledHiddenField = function(options) {
    var defaultOptions = {
        'initialValue': '',
        'class': ''
    };
    options = EzWebExt.merge(defaultOptions, options);

    StyledElements.StyledInputElement.call(this, options.initialValue, []);

    this.wrapperElement = document.createElement("div");

    this.wrapperElement.className = EzWebExt.prependWord(options['class'], 'styled_hidden_field');

    this.inputElement = document.createElement("input");
    this.inputElement.setAttribute("type", "hidden");

    if (options['name'] !== undefined)
        this.inputElement.setAttribute("name", options['name']);

    if (options['id'] != undefined)
        this.wrapperElement.setAttribute("id", options['id']);

    this.inputElement.setAttribute("value", options['initialValue']);

    this.wrapperElement.appendChild(this.inputElement);
}
StyledElements.StyledHiddenField.prototype = new StyledElements.StyledInputElement();


/**
 *
 */
StyledElements.StyledDateField = function(options) {
    var defaultOptions = {
        'initialValue': '',
        'class': ''
    };
    options = EzWebExt.merge(defaultOptions, options);

    StyledElements.StyledInputElement.call(this, options.initialValue, ['change']);

    this.wrapperElement = document.createElement("div");
    this.wrapperElement.className = EzWebExt.prependWord(options['class'], 'styled_date_field');

    this.inputElement = document.createElement("input");
    this.inputElement.setAttribute("type", "text");

    if (options['name'] != undefined) {
        this.inputElement.setAttribute("name", options['name']);
    }

    if (options['id'] != undefined) {
        this.inputElement.setAttribute("id", options['id']);
    }

    if (options['placeholder'] != undefined) {
        this.inputElement.setAttribute("placeholder", options['placeholder']);
    }

    this.inputElement.setAttribute("value", options['initialValue']);

    var div = document.createElement("div");
    div.appendChild(this.inputElement);
    this.wrapperElement.appendChild(div);
}
StyledElements.StyledDateField.prototype = new StyledElements.StyledInputElement();


/**
 * @param options Una tabla hash con opciones. Los posibles valores son los
 * siguientes:
 *   - name: nombre que tendrá el elemento input (sólo es necesario cuando se
 *     está creando un formulario).
 *   - class: lista de clases separada por espacios que se asignará al div
 *     principal de este Numeric Field. Independientemente del valor de esta
 *     opción, siempre se le asignará la clase "styled_numeric_field" al div
 *     principal.
 *   - minValue: valor mínimo que permitirá este Numeric Field.
 *   - maxValue: valor máximo que permitirá este Numeric Field.
 *
 */
StyledElements.StyledNumericField = function(options) {
    var defaultOptions = {
        'initialValue': 0,
        'class': '',
        'minValue': null,
        'maxValue': null,
        'inc': 1
    };
    options = EzWebExt.merge(defaultOptions, options);

    StyledElements.StyledInputElement.call(this, options.initialValue, ['change']);

    this.wrapperElement = document.createElement("div");
    this.wrapperElement.className = "styled_numeric_field";
    this.inputElement = document.createElement("input");
    this.inputElement.setAttribute("type", "text");

    if (options['name'] != undefined)
        this.inputElement.setAttribute("name", options['name']);

    if (options['id'] != undefined)
        this.wrapperElement.setAttribute("id", options['id']);

    if (options.minValue != null) {
        options.minValue = Number(options.minValue);
        this.inputElement.setAttribute("min", options.minValue);
    }

    if (options.maxValue != null) {
        options.maxValue = Number(options.maxValue);
        this.inputElement.setAttribute("max", options.maxValue);
    }
    options.inc = Number(options.inc);

    this.inputElement.setAttribute("value", options['initialValue']);

    this.inputElement.className = EzWebExt.prependWord(options['class'], "numeric_field");

    var topButton = document.createElement("div");
    topButton.className = "numeric_top_button";
    var bottomButton = document.createElement("div");
    bottomButton.className = "numeric_bottom_button";

    var inc = function(element, inc) {
        var value = Number(element.value);
        if (!isNaN(value)) {
            value = Math.round((value + inc) * 100) / 100;

            // Check for max & min values
            if ((inc > 0) && options['maxValue'] != null && value > options['maxValue'])
                value = options['maxValue'];
            else if ((inc < 0) && options['minValue'] != null && value < options['minValue'])
                value = options['minValue'];

            element.value = value;
        }
    };

    /* Internal events */
    EzWebExt.addEventListener(this.wrapperElement, 'mousedown', EzWebExt.stopPropagationListener, true);
    EzWebExt.addEventListener(this.wrapperElement, 'click', EzWebExt.stopPropagationListener, true);

    EzWebExt.addEventListener(topButton, "click",
        EzWebExt.bind(function(event) {
            if (this.enabled)
                inc(this.inputElement, options.inc);
        }, this),
        true);

    EzWebExt.addEventListener(bottomButton, "click",
        EzWebExt.bind(function(event) {
            if (this.enabled)
                inc(this.inputElement, -options.inc);
        }, this),
        true);

    var div = document.createElement("div");
    div.appendChild(this.inputElement);
    this.wrapperElement.appendChild(div);
    this.wrapperElement.appendChild(topButton);
    this.wrapperElement.appendChild(bottomButton);
}
StyledElements.StyledNumericField.prototype = new StyledElements.StyledInputElement();

/**
 * Este componente permite agrupar varios CheckBoxes o RadioButtons, con el
 * objetivo de tratarlos como un único campo de entrada, permitiendo obtener y
 * establecer su valor, escuchar eventos de modificación, etc... etc...
 */
StyledElements.ButtonsGroup = function(name_) {
    StyledElements.StyledInputElement.call(this, "", ['change']);

    this.name_ = name_;
    this.buttons = [];
}
StyledElements.ButtonsGroup.prototype = new StyledElements.StyledInputElement();

/**
 * Devuelve el nombre que tiene asignado este ButtonsGroup.
 */
StyledElements.ButtonsGroup.prototype.getName = function() {
    return this.name_;
}

/**
 * @private
 */
StyledElements.ButtonsGroup.prototype.insertButton = function(button) {
    this.buttons[this.buttons.length] = button;
    button.addEventListener('change',
                            EzWebExt.bind(function () {
                                var changeHandlers = this.events['change'].dispatch(this);
                            }, this));
}

StyledElements.ButtonsGroup.prototype.getValue = function() {
    if (this.buttons[0] instanceof StyledElements.StyledCheckBox) {
        var result = [];

        for (var i = 0; i < this.buttons.length; i++) {
            if (this.buttons[i].inputElement.checked)
                result[result.length] = this.buttons[i].inputElement.value;
        }

        return result;
    } else {
        for (var i = 0; i < this.buttons.length; i++) {
            if (this.buttons[i].inputElement.checked)
                return [this.buttons[i].inputElement.value];
        }
        return [];
    }
}

StyledElements.ButtonsGroup.prototype.setValue = function(newValue) {
    if (newValue == null) {
        newValue = [];
    } else if (typeof newValue === 'string') {
        newValue = [newValue];
    }

    for (var i = 0; i < this.buttons.length; i++) {
        if (newValue.indexOf(this.buttons[i].inputElement.value) !== -1) {
            this.buttons[i].setValue(true);
        } else {
            this.buttons[i].setValue(false);
        }
    }
}

StyledElements.ButtonsGroup.prototype.reset = function() {
    for (var i = 0; i < this.buttons.length; i++) {
        this.buttons[i].reset();
    }
}

/**
 * Devuelve una lista de los elementos StyledCheckBox o StyledRadioButton
 * seleccionados. En caso de que la selección este vacía, este método devolverá
 * una lista vacía y en caso de que este ButtonGroup este formado por
 * StyledRadioButtons, la selección será como mucho de un elemento.
 */
StyledElements.ButtonsGroup.prototype.getSelectedButtons = function() {
    if (this.buttons[0] instanceof StyledElements.StyledCheckBox) {
        var result = [];

        for (var i = 0; i < this.buttons.length; i++) {
            if (this.buttons[i].inputElement.checked)
                result[result.length] = this.buttons[i];
        }

        return result;
    } else {
        for (var i = 0; i < this.buttons.length; i++) {
            if (this.buttons[i].inputElement.checked)
                return [this.buttons[i]];
        }
        return [];
    }
}

/**
 *
 */
StyledElements.StyledCheckBox = function StyledCheckBox(options) {
    var defaultOptions = {
        'initiallyChecked': false,
        'class': '',
        'group': null
    };
    options = EzWebExt.merge(defaultOptions, options);

    StyledElements.StyledInputElement.call(this, options.initiallyChecked, ['change']);

    this.wrapperElement = document.createElement("input");

    this.wrapperElement.setAttribute("type", "checkbox");
    this.inputElement = this.wrapperElement;

    if (options['name'] != undefined) {
        this.inputElement.setAttribute("name", options['name']);
    }

    if (options['id'] != undefined) {
        this.wrapperElement.setAttribute("id", options['id']);
    }

    if (options['initiallyChecked'] == true) {
        this.inputElement.setAttribute("checked", true);
    }

    if (options.group_ instanceof StyledElements.ButtonsGroup) {
        this.wrapperElement.setAttribute("name", options.group.getName());
        option.group.insertButton(this);
    } else if (typeof options.group === 'string') {
        this.wrapperElement.setAttribute("name", options.group);
    }

    /* Internal events */
    EzWebExt.addEventListener(this.inputElement, 'mousedown', EzWebExt.stopPropagationListener, true);
    EzWebExt.addEventListener(this.inputElement, 'click', EzWebExt.stopPropagationListener, true);
    EzWebExt.addEventListener(this.inputElement, 'change',
                                EzWebExt.bind(function () {
                                    if (this.enabled)
                                        this.events['change'].dispatch(this);
                                }, this),
                                true);
}

StyledElements.StyledCheckBox.prototype = new StyledElements.StyledInputElement();

StyledElements.StyledCheckBox.prototype.insertInto = function (element, refElement) {
    var checked = this.inputElement.checked; // Necesario para IE
    StyledElements.StyledElement.prototype.insertInto.call(this, element, refElement);
    this.inputElement.checked = checked; // Necesario para IE
}

StyledElements.StyledCheckBox.prototype.reset = function() {
    this.inputElement.checked = this.defaultValue;
}

StyledElements.StyledCheckBox.prototype.getValue = function() {
    return this.inputElement.checked;
}

StyledElements.StyledCheckBox.prototype.setValue = function(newValue) {
    this.inputElement.checked = newValue;
}

/**
 *
 */
StyledElements.StyledRadioButton = function(nameGroup_, value, options) {
    var defaultOptions = {
        'initiallyChecked': false,
        'class': ''
    };
    options = EzWebExt.merge(defaultOptions, options);

    StyledElements.StyledInputElement.call(this, options.initiallyChecked, ['change']);

    this.wrapperElement = document.createElement("input");

    this.wrapperElement.setAttribute("type", "radio");
    this.wrapperElement.setAttribute("value", value);
    this.inputElement = this.wrapperElement;

    if (options['name'] != undefined)
        this.inputElement.setAttribute("name", options['name']);

    if (options['id'] != undefined)
        this.wrapperElement.setAttribute("id", options['id']);

    if (options['initiallyChecked'] == true)
        this.inputElement.setAttribute("checked", true);

    if (nameGroup_ instanceof StyledElements.ButtonsGroup) {
        this.wrapperElement.setAttribute("name", nameGroup_.getName());
        nameGroup_.insertButton(this);
    } else if (nameGroup_) {
        this.wrapperElement.setAttribute("name", nameGroup_);
    }

    /* Internal events */
    EzWebExt.addEventListener(this.inputElement, 'mousedown', EzWebExt.stopPropagationListener, true);
    EzWebExt.addEventListener(this.inputElement, 'click', EzWebExt.stopPropagationListener, true);
    EzWebExt.addEventListener(this.inputElement, 'change',
                                EzWebExt.bind(function () {
                                    if (this.enabled)
                                        this.events['change'].dispatch(this);
                                }, this),
                                true);
}
StyledElements.StyledRadioButton.prototype = new StyledElements.StyledInputElement();

StyledElements.StyledRadioButton.prototype.insertInto = function (element, refElement) {
    var checked = this.inputElement.checked; // Necesario para IE
    StyledElements.StyledElement.prototype.insertInto.call(this, element, refElement);
    this.inputElement.checked = checked; // Necesario para IE
}

StyledElements.StyledRadioButton.prototype.reset = function() {
    this.inputElement.checked = this.defaultValue;
}

StyledElements.StyledRadioButton.prototype.setValue = function(newValue) {
    this.inputElement.checked = newValue;
}

/**
 * El componente Styled HPaned crea dos paneles separados por un separador y
 * que permite redimensionar los dos paneles a la vez con el objetivo de que
 * siguan ocupando el mismo espacio en conjunto.
 *
 * @param options Opciones admitidas:
 *                -{Number} handlerPosition Indica la posición en la que estará
 *                 el separador inicialmente. Esta posición deberá ir indicada
 *                 en porcentajes. Valor por defecto: 50.
 *                -{Number} leftMinWidth Indica el tamaño mínimo que tendrá el
 *                 panel izquierdo del componente. Este tamaño mínimo tiene que
 *                 ir en pixels.
 *                -{Number} rightMinWidth Indica el tamaño mínimo que tendrá el
 *                 panel derecho del componente. Este tamaño mínimo tiene que
 *                 ir en pixels.
 */
StyledElements.StyledHPaned = function(options) {
    StyledElements.StyledElement.call(this, []);

    var defaultOptions = {
        'class': '',
        'full': true,
        'handlerPosition': 50,
        'leftContainerOptions': {'class': ''},
        'leftMinWidth': 0,
        'rightMinWidth': 0,
        'rightContainerOptions': {'class': ''}
    };
    options = EzWebExt.merge(defaultOptions, options);

    this.wrapperElement = document.createElement("div");
    this.wrapperElement.className = EzWebExt.prependWord(options['class'], "hpaned");

    /* Force leftpanel class */
    options.leftContainerOptions['class'] = EzWebExt.prependWord(options.leftContainerOptions['class'], 'leftpanel');
    options.leftContainerOptions['useFullHeight'] = true;
    this.leftPanel = new StyledElements.Container(options.leftContainerOptions);

    this.handler = document.createElement("div");
    this.handler.className = "handler";

    /* Force rightpanel class */
    options.rightContainerOptions['class'] = EzWebExt.prependWord(options.rightContainerOptions['class'], 'rightpanel');
    options.leftContainerOptions['useFullHeight'] = true;
    this.rightPanel = new StyledElements.Container(options.rightContainerOptions);

    this.leftPanel.insertInto(this.wrapperElement);
    this.wrapperElement.appendChild(this.handler);
    this.rightPanel.insertInto(this.wrapperElement);

    this.handlerPosition = options['handlerPosition'];
    this.leftMinWidth = options['leftMinWidth'];
    this.rightMinWidth = options['rightMinWidth'];

    /* Process other options */
    if (options['name'] !== undefined)
        this.inputElement.setAttribute("name", options['name']);

    if (options['id'] != undefined)
        this.wrapperElement.setAttribute("id", options['id']);

    if (options['full'])
        EzWebExt.appendClassName(this.wrapperElement, 'full');

    /*
     * Code for handling internal hpaned events
     */
    var hpaned = this;
    var xStart, handlerPosition, hpanedWidth;

    function endresize(e) {
        document.oncontextmenu = null; //reenable context menu
        document.onmousedown = null; //reenable text selection

        EzWebExt.removeEventListener(document, "mouseup", endresize, true);
        EzWebExt.removeEventListener(document, "mousemove", resize, true);

        hpaned.repaint(false);

        EzWebExt.addEventListener(hpaned.handler, "mousedown", startresize, true);
    }

    function resize(e) {
        var screenX = parseInt(e.screenX);
        xDelta = xStart - screenX;
        xStart = screenX;
        handlerPosition = hpanedWidth * (handlerPosition / 100);
        handlerPosition -= xDelta;
        handlerPosition = (handlerPosition / hpanedWidth) * 100;
        if (handlerPosition > 100)
            hpaned.handlerPosition = 100;
        else if (handlerPosition < 0)
            hpaned.handlerPosition = 0;
        else
            hpaned.handlerPosition = handlerPosition;

        hpaned.repaint(true);
    }

    function startresize(e) {
        document.oncontextmenu = function() { return false; }; //disable context menu
        document.onmousedown = function() { return false; }; //disable text selection
        EzWebExt.removeEventListener(hpaned.handler, "mousedown", startresize, true);

        xStart = parseInt(e.screenX);
        hpanedWidth = hpaned.wrapperElement.parentNode.offsetWidth - 5;
        handlerPosition = hpaned.handlerPosition;

        EzWebExt.addEventListener(document, "mousemove", resize, true);
        EzWebExt.addEventListener(document, "mouseup", endresize, true);
    }

    EzWebExt.addEventListener(hpaned.handler, "mousedown", startresize, true);
}
StyledElements.StyledHPaned.prototype = new StyledElements.StyledElement();

StyledElements.StyledHPaned.prototype.insertInto = function (element, refElement) {
    StyledElements.StyledElement.prototype.insertInto.call(this, element, refElement);

    this.repaint();
    EzWebExt.addEventListener(window, "resize",
                            EzWebExt.bind(this.repaint, this),
                            true);
}

StyledElements.StyledHPaned.prototype.getLeftPanel = function () {
    return this.leftPanel;
}

StyledElements.StyledHPaned.prototype.getRightPanel = function () {
    return this.rightPanel;
}

StyledElements.StyledHPaned.prototype.repaint = function(temporal) {
    temporal = temporal !== undefined ? temporal: false;

    var height = this._getUsableHeight();
    if (height == null)
        return; // nothing to do

    // Height
    this.wrapperElement.style.height = (height + "px");

    // Width
    this.wrapperElement.style.width = "";

    var minWidth = this.leftMinWidth + this.rightMinWidth + this.handler.offsetWidth;
    var width = this._getUsableWidth() - this.handler.offsetWidth;
    if (width < minWidth) {
        width = minWidth;
        this.wrapperElement.style.width = width + "px";
    }

    var handlerMiddle = Math.floor(width * (this.handlerPosition / 100));

    var newLeftPanelWidth = handlerMiddle;
    if (newLeftPanelWidth <  this.leftMinWidth) {
        handlerMiddle += this.leftMinWidth - newLeftPanelWidth;
        newLeftPanelWidth = this.leftMinWidth;
    }

    var newRightPanelWidth = width - handlerMiddle;
    if (newRightPanelWidth <  this.rightMinWidth) {
        handlerMiddle -= this.rightMinWidth - newRightPanelWidth;
        newRightPanelWidth = this.rightMinWidth;
        newLeftPanelWidth = handlerMiddle;
    }

    /* Real width update */
    this.leftPanel.wrapperElement.style.width = newLeftPanelWidth + "px";
    this.rightPanel.wrapperElement.style.width = newRightPanelWidth + "px";
    this.handler.style.left = handlerMiddle + "px";

    /* Propagate resize event */
    this.leftPanel.repaint(temporal);
    this.rightPanel.repaint(temporal);
}

/**
 * Este compontente representa a un tab de un notebook.
 */
StyledElements.Tab = function(id, notebook, options) {
    if (arguments.length == 0) {
        return;
    }

    if (!(notebook instanceof StyledElements.StyledNotebook)) {
        throw new Error("Invalid notebook argument");
    }

    var defaultOptions = {
        'closable': true,
        'containerOptions': {},
        'name': ''
    };
    options = EzWebExt.merge(defaultOptions, options);
    // Work around common typo
    if (options.closeable) {
        options.closable = options.closeable;
    }
    options['useFullHeight'] = true;

    this.tabId = id;
    this.notebook = notebook;

    this.tabElement = document.createElement("div");
    this.tabElement.className = "tab";
    this.name = document.createElement('span');
    this.tabElement.appendChild(this.name);

    /* call to the parent constructor */
    StyledElements.Container.call(this, options['containerOptions'], ['show', 'hide', 'close']);

    EzWebExt.prependClassName(this.wrapperElement, "tab hidden"); // TODO

    EzWebExt.addEventListener(this.tabElement, "click",
                                EzWebExt.bind(function () {
                                    this.notebook.goToTab(this.tabId);
                                }, this),
                                false);


    /* Process options */
    if (options.closable) {
        var closeButton = new StyledElements.StyledButton({
            text: "X",
            plain: true,
            'class': "close_button",
            title: 'Close Tab'
        });
        closeButton.insertInto(this.tabElement);

        closeButton.addEventListener("click",
                                     EzWebExt.bind(this.close, this),
                                     false);
    }

    this.title = options.title;
    this.rename(options.name);
}
StyledElements.Tab.prototype = new StyledElements.Container({extending: true});

/**
 * Elimina este Tab del notebook al que está asociado.
 */
StyledElements.Tab.prototype.close = function() {
    this.notebook.removeTab(this.tabId);
}

/**
 * Establece el texto que se mostrará dentro de la pestaña que se mostrará en
 * <code>notebook</code> y que representará al contenido de este
 * <code>Tab</code>.
 */
StyledElements.Tab.prototype.rename = function(newName) {
    this.nameText = newName;
    EzWebExt.setTextContent(this.name, this.nameText);

    this._updateTitle();
}

/**
 * Establece el texto que se mostrará, mediante un dialogo popup, cuando el
 * puntero del ratón este encima de la pestaña simulando al atributo "title" de
 * los elementos HTML.
 */
StyledElements.Tab.prototype.setTitle = function(newTitle) {
    this.title = newTitle;

    this._updateTitle();
};

StyledElements.Tab.prototype._updateTitle = function() {
    if (typeof this.title === 'undefined' || this.title === null) {
        this.tabElement.setAttribute('title', this.nameText);
    } else {
        this.tabElement.setAttribute('title', this.title);
    }
}

/**
 * Establece el icono de este Tab. En caso de no pasar un icono del notebook al
 * que está asociado.
 */
StyledElements.Tab.prototype.setIcon = function(iconURL) {
    if (iconURL == null) {
        if (this.tabIcon != null) {
            EzWebExt.removeFromParent(this.tabIcon);
            this.tabIcon = null;
        }
        return;
    }

    if (this.tabIcon == null) {
        this.tabIcon = document.createElement('img');
        this.tabElement.insertBefore(this.tabIcon, this.tabElement.firstChild);
    }
    this.tabIcon.src = iconURL;
}

StyledElements.Tab.prototype.setVisible = function (newStatus) {
    if (newStatus) {
        EzWebExt.appendClassName(this.tabElement, "selected");
        EzWebExt.removeClassName(this.wrapperElement, "hidden");
        this.repaint(false);
        this.events['show'].dispatch(this);
    } else {
        EzWebExt.removeClassName(this.tabElement, "selected");
        EzWebExt.appendClassName(this.wrapperElement, "hidden");
        this.events['hide'].dispatch(this);
    }
}

StyledElements.Tab.prototype.getId = function() {
    return this.tabId;
}

/**
 * TODO change this.
 */
StyledElements.Tab.prototype.getTabElement = function() {
    return this.tabElement;
}

/**
 * Muestra un diálogo de alerta con un mensaje, título e icono.
 *
 * TODO rellenar la documentación
 *
 * @param title
 * @param content
 * @param options Opciones disponibles:
 *         -minWidth:
 *         -maxWidth:
 *         -minWidth:
 *         -maxWidth:
 *         -type: Indica el tipo de mesaje que se quiere mostrar. Los valores
 *          disponibles son: EzWebExt.ALERT_INFO, EzWebExt.ALERT_WARNING,
 *          EzWebExt.ALERT_ERROR. Valor por defecto: EzWebExt.ALERT_INFO.
 */
StyledElements.StyledAlert = function(title, content, options) {
    var defaultOptions = {
        'closable': true,
        'minWidth': 200,
        'maxWidth': 400,
        'minHeight': 100,
        'maxHeight': 200,
        'type': EzWebExt.ALERT_INFO
    };
    this.options = EzWebExt.merge(defaultOptions, options);

    StyledElements.StyledElement.call(this, ['close']);

    var image = document.createElement("img");
    image.src = EzWebExt.getResourceURL("/images/degradado.png");

    this.wrapperElement = document.createElement("div");
    this.wrapperElement.className = "styled_alert";

    this.backgroundDiv = document.createElement("div");
    this.backgroundDiv.className = "background";

    this.messageDiv = document.createElement("div");
    this.messageDiv.className = "message";

    this.wrapperElement.appendChild(this.backgroundDiv);
    this.wrapperElement.appendChild(this.messageDiv);

    this.header = document.createElement("div");
    this.header.className = "header";

    var table = document.createElement("table");
    var tbody = document.createElement("tbody");
    table.appendChild(tbody);
    table.setAttribute("width", "100%");
    this.header.appendChild(table);

    var tr = tbody.insertRow(-1);
    var td = tr.insertCell(-1);
    td.className = "title";

    var types = ["info", "warning", "error"];
    image = document.createElement("img");
    image.src = EzWebExt.getResourceURL("/images/dialog/dialog-" + types[this.options['type']] + '.png');
    td.appendChild(image);

    if (title) {
        td.appendChild(document.createTextNode(title));
    }

    this._closeButton = null;
    if (this.options.closable !== false) {
        this._closeButton = tr.insertCell(-1);
        this._closeButton.className = "close_button";
    }

    this.messageDiv.appendChild(this.header);

    this.content = new StyledElements.Container({'class': 'content'});
    if (typeof content === 'string') {
        this.content.wrapperElement.innerHTML = content;
    } else {
        this.content.appendChild(content);
    }
    this.content.insertInto(this.messageDiv);

    EzWebExt.prependClassName(this.wrapperElement, types[this.options['type']]);

    /* Events code */
    if (this._closeButton !== null) {
        this._closeCallback = EzWebExt.bind(this.close, this);
        EzWebExt.addEventListener(this._closeButton, "click", this._closeCallback, true);
    }
}
StyledElements.StyledAlert.prototype = new StyledElements.StyledElement();

StyledElements.StyledAlert.prototype.appendChild = function(child) {
    this.content.appendChild(child);
}

/**
 * Closes this alert. After this StyledAlert is closed, it cannot be used anymore.
 */
StyledElements.StyledAlert.prototype.close = function() {
    if (EzWebExt.XML.isElement(this.wrapperElement.parentNode)) {
        EzWebExt.removeFromParent(this.wrapperElement);
        this.events['close'].dispatch(this);
    }

    this.wrapperElement = null;

    if (this._closeButton != null) {
        EzWebExt.removeEventListener(this._closeButton, "click", this._closeCallback, true);
    }
    StyledElements.StyledElement.prototype.destroy.call();
};

StyledElements.StyledAlert.prototype.destroy = function() {
    this.close();

    StyledElements.StyledElement.prototype.destroy.call(this);
};

StyledElements.StyledAlert.prototype.insertInto = function(element, refElement){
    StyledElements.StyledElement.prototype.insertInto.call(this, element, refElement);
    this.repaint();
}

StyledElements.StyledAlert.prototype.repaint = function(temporal) {
    //temporal = temporal !== undefined ? temporal: false;

    var ref_element;

    if (this.wrapperElement) {

        ref_element = this.wrapperElement.parentNode;
        var parent_position = EzWebExt.getRelativePosition(ref_element, document.body);
        this.wrapperElement.style.top = parent_position.y + 'px';
        this.wrapperElement.style.left = parent_position.x + 'px';
        this.wrapperElement.style.width = ref_element.clientWidth + 'px';
        this.wrapperElement.style.height = ref_element.clientHeight + 'px';

        // Adjust messageDiv height and messageDiv width
        var width = (this.wrapperElement.offsetWidth * 80 / 100);
        var height = (this.wrapperElement.offsetHeight * 80 / 100);
        var positionHeight = (this.wrapperElement.offsetHeight * 10 / 100);
        var positionWidth = (this.wrapperElement.offsetWidth * 10 / 100);
  /*
        width = (width > this.options['max_width']) ? this.options['max_width']:
                    ((width < this.options['min_width']) ? this.options['min_width'] : width);
        height = (height > this.options['max_height']) ? this.options['max_height']:
                    ((height < this.options['min_height']) ? this.options['min_height'] : height);
  */
        this.messageDiv.style.top = positionHeight + 'px';
        this.messageDiv.style.left = positionWidth + 'px';
        this.messageDiv.style.width = width + 'px';
        this.messageDiv.style.height = height + 'px';

        // Adjust Content Height
        var messageDivStyle = document.defaultView.getComputedStyle(this.messageDiv, null);
        var headerStyle = document.defaultView.getComputedStyle(this.header, null);
        var contentStyle = document.defaultView.getComputedStyle(this.content.wrapperElement, null);

        height = height - this.header.offsetHeight -
            messageDivStyle.getPropertyCSSValue('border-top-width').getFloatValue(CSSPrimitiveValue.CSS_PX) -
            messageDivStyle.getPropertyCSSValue('border-bottom-width').getFloatValue(CSSPrimitiveValue.CSS_PX) -
            headerStyle.getPropertyCSSValue('margin-bottom').getFloatValue(CSSPrimitiveValue.CSS_PX) -
            headerStyle.getPropertyCSSValue('margin-top').getFloatValue(CSSPrimitiveValue.CSS_PX) -
            contentStyle.getPropertyCSSValue('margin-bottom').getFloatValue(CSSPrimitiveValue.CSS_PX);
        if (height < 0) {
            height = 0;
        }
        this.content.wrapperElement.style.height = height + 'px';

        this.content.repaint(temporal);
    }
}

/**
 * @experimental
 *
 * Permite ejecutar secuencialmente distintos comandos. Dado que javascript no
 * tiene un interfaz para manejo de hilos, esto realmente sólo es necesario en
 * los casos en los que la concurrencia provenga a través de alguno de los
 * mecanismos de señales soportados por javascript (de momento, estos son los
 * eventos, los temporizadores y las peticiones asíncronas mediante el objeto
 * XMLHttpRequest).
 */
var CommandQueue = function (context, initFunc, stepFunc) {
    var running = false;
    var elements = new Array();
    var step = 0;
    var stepTimes = null;

    function doStep() {
        if (stepFunc(step, context)) {
            var timeDiff = stepTimes[step] - (new Date()).getTime();
            if (timeDiff < 0)
                timeDiff = 0

            step++;
            setTimeout(doStep, timeDiff);
        } else {
            doInit()
        }
    }

    function doInit() {
        var command;
        do {
            command = elements.shift();
        } while (command != undefined && !(stepTimes = initFunc(context, command)));

        if (command != undefined) {
            step = 0;
            var timeDiff = stepTimes[step] - (new Date()).getTime();
            if (timeDiff < 0)
                timeDiff = 0
            setTimeout(doStep, timeDiff);
        } else {
            running = false;
        }
    }

    /**
     * Añade un comando a la cola de procesamiento. El comando será procesado
     * despues de que se procesen todos los comandos añadidos anteriormente.
     *
     * @param command comando a añadir a la cola de procesamiento. El tipo de
     * este párametro tiene que ser compatible con las funciones initFunc y
     * stepFunc pasadas en el constructor.
     */
    this.addCommand = function(command) {
        if (command == undefined)
            return;

        elements.push(command);

        if (!running) {
            running = true;
            doInit();
        }
    }
}

/**
 * Este compontente representa al contenedor para una alternativa usable por el
 * componente StyledAlternatives.
 */
StyledElements.Alternative = function(id, options) {
    var defaultOptions;

    if (arguments.length == 0) {
        return;
    }

    defaultOptions = {
        useFullHeight: true
    };
    options = EzWebExt.merge(defaultOptions, options);

    this.altId = id;

    /* call to the parent constructor */
    StyledElements.Container.call(this, options, ['show', 'hide']);

    EzWebExt.appendClassName(this.wrapperElement, "hidden"); // TODO
}
StyledElements.Alternative.prototype = new StyledElements.Container({extending: true});

StyledElements.Alternative.prototype.setVisible = function (newStatus) {
    if (newStatus) {
        this.events['show'].dispatch(this);
        EzWebExt.removeClassName(this.wrapperElement, "hidden");
        this.repaint(false);
    } else {
        EzWebExt.appendClassName(this.wrapperElement, "hidden");
        this.events['hide'].dispatch(this);
    }
}

StyledElements.Alternative.prototype.isVisible = function (newStatus) {
    return !EzWebExt.hasClassName(this.wrapperElement, "hidden");
};

StyledElements.Alternative.prototype.getId = function() {
    return this.altId;
}

var PaginationInterface = function(pagination, options) {
    var defaultOptions = {
        'layout': '%(firstBtn)s%(prevBtn)s Page: %(currentPage)s/%(totalPages)s %(nextBtn)s%(lastBtn)s',
        'autoHide': false
    };
    options = EzWebExt.merge(defaultOptions, options);
    this.autoHide = options.autoHide;

    StyledElements.StyledElement.call(this, []);

    this.pagination = pagination;

    this.wrapperContainer = new StyledElements.Container();
    this.wrapperContainer.addClassName('pagination');
    this.wrapperElement = this.wrapperContainer.wrapperElement;

    this.firstBtn = new StyledElements.StyledButton({'plain': true, 'class': 'icon-first-page'});
    this.firstBtn.addEventListener('click', pagination.goToFirst.bind(pagination));

    this.prevBtn = new StyledElements.StyledButton({'plain': true, 'class': 'icon-prev-page'});
    this.prevBtn.addEventListener('click', pagination.goToPrevious.bind(pagination));

    this.nextBtn = new StyledElements.StyledButton({'plain': true, 'class': 'icon-next-page'});
    this.nextBtn.addEventListener('click', pagination.goToNext.bind(pagination));

    this.lastBtn = new StyledElements.StyledButton({'plain': true, 'class': 'icon-last-page'});
    this.lastBtn.addEventListener('click', pagination.goToLast.bind(pagination));

    this.currentPageLabel = document.createElement('span');
    EzWebExt.addClassName(this.currentPageLabel, 'current-page');

    this.totalPagesLabel = document.createElement('span');
    EzWebExt.addClassName(this.totalPagesLabel, 'total-pages');

    this._updateLayout(options.layout);

    EzWebExt.setTextContent(this.currentPageLabel, this.currentPage + 1);
    EzWebExt.setTextContent(this.totalPagesLabel, this.totalPages);

    this._updateButtons();

    this.pagination.addEventListener('requestEnd', EzWebExt.bind(this.pPaginationChanged, this));
}
PaginationInterface.prototype = new StyledElements.StyledElement();


PaginationInterface.prototype._updateLayout = function(pattern) {

    var elements = {
        'firstBtn': this.firstBtn,
        'prevBtn': this.prevBtn,
        'nextBtn': this.nextBtn,
        'lastBtn': this.lastBtn,
        'currentPage': this.currentPageLabel,
        'totalPages': this.totalPagesLabel
    }
    var wrapper = this.wrapperContainer;
    while (pattern) {
        var result = pattern.match(/^%\((\w+)\)s/,1);
        if (result) {
            if (elements[result[1]] != undefined) {
                wrapper.appendChild(elements[result[1]]);
            } else {
                wrapper.appendChild(document.createTextNode(result[0]));
            }
            pattern = pattern.substr(result[0].length);
        }
        var text = EzWebExt.split(pattern, /%\(\w+\)s/, 1);
        if (text && text.length > 0 && text[0] != '') {
            wrapper.appendChild(document.createTextNode(text[0]));
            pattern = pattern.substr(text[0].length);
        }
    }
}


PaginationInterface.prototype.changeLayout = function(newLayout) {
    this._updateLayout(newLayout);
}

PaginationInterface.prototype._updateButtons = function() {
    if (this.pagination.currentPage <= 1) {
        this.prevBtn.disable();
        this.firstBtn.disable();
    } else {
        this.prevBtn.enable();
        this.firstBtn.enable();
    }

    if (this.pagination.currentPage >= this.pagination.totalPages) {
        this.nextBtn.disable();
        this.lastBtn.disable();
    } else {
        this.nextBtn.enable();
        this.lastBtn.enable();
    }
}

PaginationInterface.prototype._pageChange = function() {
    EzWebExt.setTextContent(this.currentPageLabel, this.currentPage + 1);
    this._updateButtons();
};

PaginationInterface.prototype.pPaginationChanged = function pPaginationChanged(pagination) {

    if (this.autoHide && this.pagination.totalPages === 1) {
        this.wrapperElement.style.display = 'none';
    } else {
        this.wrapperElement.style.display = '';
    }

    EzWebExt.setTextContent(this.totalPagesLabel, this.pagination.totalPages);
    EzWebExt.setTextContent(this.currentPageLabel, this.pagination.currentPage);
    this._updateButtons();
};

/**
 *
 */
StyledElements.MenuItem = function(text, handler, context) {
    StyledElements.StyledElement.call(this, ['click', 'mouseover', 'mouseout']);

    this.wrapperElement = document.createElement("div");
    EzWebExt.addClassName(this.wrapperElement, "menu_item");

    var span = document.createElement("span");
    span.appendChild(document.createTextNode(text));
    this.wrapperElement.appendChild(span);

    this.run = handler;
    this.context = context;

    // Internal events
    this._mouseoverEventHandler = EzWebExt.bind(function(event) {
        if (this.enabled) {
            EzWebExt.addClassName(this.wrapperElement, "hovered");
            this.events['mouseover'].dispatch(this);
        }
    }, this);
    EzWebExt.addEventListener(this.wrapperElement, "mouseover", this._mouseoverEventHandler, false);
    this._mouseoutEventHandler = EzWebExt.bind(function(event) {
        if (this.enabled) {
            EzWebExt.removeClassName(this.wrapperElement, "hovered");
            this.events['mouseout'].dispatch(this);
        }
    }, this)
    EzWebExt.addEventListener(this.wrapperElement, "mouseout", this._mouseoutEventHandler, false);

    this._clickHandler = EzWebExt.bind(function(event) {
        event.stopPropagation();
        if (this.enabled) {
            this.events['mouseout'].dispatch(this);
            this.events['click'].dispatch(this);
        }
    }, this);
    EzWebExt.addEventListener(this.wrapperElement, "click", this._clickHandler, false);
}
StyledElements.MenuItem.prototype = new StyledElements.StyledElement();

StyledElements.MenuItem.prototype.destroy = function() {
    if (EzWebExt.XML.isElement(this.wrapperElement.parentNode)) {
        EzWebExt.removeFromParent(this.wrapperElement);
    }
    EzWebExt.removeEventListener(this.wrapperElement, "mouseover", this._mouseoverEventHandler, false);
    EzWebExt.removeEventListener(this.wrapperElement, "mouseout", this._mouseoutEventHandler, false);
    EzWebExt.removeEventListener(this.wrapperElement, "click", this._clickHandler, false);

    this._mouseoverEventHandler = null;
    this._mouseoutEventHandler = null;
    this._clickHandler = null;

    StyledElements.StyledElement.prototype.destroy.call(this);
}


/**
 *
 */
StyledElements.DynamicMenuItems = function() {
}

StyledElements.DynamicMenuItems.prototype.build = function() {
    return [];
}


/**
 *
 */
StyledElements.SendMenuItems = function(variable, getData) {
    this.variable = variable;
    this.getData = getData;
}
StyledElements.SendMenuItems.prototype = new StyledElements.DynamicMenuItems();

StyledElements.SendMenuItems.prototype.build = function() {
    var i, actions, action, items, item;

    actions = EzWebExt.getEventActions(this.variable);
    items = [];

    for (i = 0; i < actions.length; i += 1) {
        action = actions[i];

        item = new StyledElements.MenuItem(action.label, EzWebExt.bind(function(context) {
            this.control.variable.set(this.control.getData(context), {targetSlots: this.slots});
        }, {control: this, slots: [action.value]}));

        items.push(item);
    }

    return items;
}


/**
 * @abstract
 */
StyledElements.PopupMenuBase = function (options) {
    var defaultOptions = {
        'position': 'bottom-left',
    };
    options = EzWebExt.merge(defaultOptions, options);

    if (options.extending) {
        return;
    }

    StyledElements.ObjectWithEvents.call(this, ['itemOver', 'visibilityChange']);

    this.wrapperElement = window.parent.document.createElement('div');
    this.wrapperElement.className = 'popup_menu hidden';
    this._context = null;
    this._position = options.position;
    this._items = [];
    this._dynamicItems = [];
    this._submenus = [];
    this._menuItemCallback = EzWebExt.bind(this._menuItemCallback, this);
    this._menuItemEnterCallback = EzWebExt.bind(this._menuItemEnterCallback, this);
};
StyledElements.PopupMenuBase.prototype = new StyledElements.ObjectWithEvents();

StyledElements.PopupMenuBase.prototype._append = function(child, where) {
    if (child instanceof StyledElements.MenuItem) {
        child.addEventListener('click', this._menuItemCallback);
        child.addEventListener('mouseover', this._menuItemEnterCallback);
    } else if (child instanceof StyledElements.SubMenuItem) {
        child.addEventListener('click', this._menuItemCallback);
        child.addEventListener('mouseover', this._menuItemEnterCallback);
        child._setParentPopupMenu(this);
    }
    where.push(child);
}

StyledElements.PopupMenuBase.prototype.append = function(child) {
    this._append(child, this._items);
}

StyledElements.PopupMenuBase.prototype.appendSeparator = function() {
    this.append(new StyledElements.Separator());
}

StyledElements.PopupMenuBase.prototype.setContext = function setContext (context) {
    this._context = context;
};

StyledElements.PopupMenuBase.prototype._menuItemCallback = function _menuItemCallback (menuItem) {
    this.hide();
    menuItem.run(this._context, menuItem.context);
};

StyledElements.PopupMenuBase.prototype.isVisible = function() {
    return EzWebExt.XML.isElement(this.wrapperElement.parentNode);
};

StyledElements.PopupMenuBase.prototype.show = function(refPosition) {
    var i, j, item, generatedItems, generatedItem;

    if (this.isVisible()) {
        return; // This Popup Menu is already visible => nothing to do
    }

    for (i = 0; i < this._items.length; i += 1) {
        item = this._items[i];
        if (item instanceof StyledElements.DynamicMenuItems) {
            generatedItems = item.build(this._context);
            for (j = 0; j < generatedItems.length; j += 1) {
                generatedItem = generatedItems[j];

                this._append(generatedItem, this._dynamicItems);

                if (generatedItem instanceof StyledElements.MenuItem || generatedItem instanceof StyledElements.Separator) {
                    generatedItem.insertInto(this.wrapperElement);
                } else if (generatedItem instanceof StyledElements.SubMenuItem) {
                    generatedItem._getMenuItem().insertInto(this.wrapperElement);
                }
            }
        } else if (item instanceof StyledElements.MenuItem || item instanceof StyledElements.Separator) {
            item.insertInto(this.wrapperElement);
        } else if (item instanceof StyledElements.SubMenuItem) {
            item._getMenuItem().insertInto(this.wrapperElement);
            this._submenus.push(item);
        } else {
            this.wrapperElement.appendChild(item);
        }
    }

    EzWebExt.removeClassName(this.wrapperElement, 'hidden');
    window.parent.document.body.appendChild(this.wrapperElement);
    this.events['visibilityChange'].dispatch(this);

    // TODO Hay que ajustar refPosition.y y refPosition.x para que el menú no
    // pueda salirse del área visible
    if ('x' in refPosition && 'y' in refPosition) {
        this.wrapperElement.style.top = refPosition.y + "px";
        this.wrapperElement.style.left = refPosition.x + "px";
    } else {
        switch (this._position) {
        case 'top-left':
            this.wrapperElement.style.top = (refPosition.top - this.wrapperElement.offsetHeight + 1) + "px";
            this.wrapperElement.style.left = (refPosition.right - this.wrapperElement.offsetWidth) + "px";
            break;
        case 'top-right':
            this.wrapperElement.style.top = (refPosition.top - this.wrapperElement.offsetHeight + 1) + "px";
            this.wrapperElement.style.left = refPosition.left + "px";
            break;
        case 'bottom-right':
            this.wrapperElement.style.top = (refPosition.bottom - 1) + "px";
            this.wrapperElement.style.left = refPosition.left + "px";
            break;
        default:
        case 'bottom-left':
            this.wrapperElement.style.top = (refPosition.bottom - 1) + "px";
            this.wrapperElement.style.left = (refPosition.right - this.wrapperElement.offsetWidth) + "px";
            break;
        }
    }
    this.wrapperElement.style.display = 'block';
};

StyledElements.PopupMenuBase.prototype.hide = function() {
    var i, aux;

    if (!this.isVisible()) {
        return; // This Popup Menu is already hidden => nothing to do
    }

    EzWebExt.addClassName(this.wrapperElement, 'hidden');

    for (i = 0; i < this._submenus.length; i += 1) {
        this._submenus[i].hide();
    }

    for (i = 0; i < this._dynamicItems.length; i += 1) {
        aux = this._dynamicItems[i];
        if (aux instanceof StyledElements.SubMenuItem) {
            aux.hide();
        }
        aux.destroy();
    }
    this._dynamicItems = [];
    this._submenus = [];
    this.wrapperElement.innerHTML = '';
    EzWebExt.removeFromParent(this.wrapperElement);

    this.events['visibilityChange'].dispatch(this);
};

StyledElements.PopupMenuBase.prototype._menuItemEnterCallback = function(menuItem) {
    this.events['itemOver'].dispatch(this, menuItem);
}

StyledElements.PopupMenuBase.prototype.destroy = function() {
    var i, item;

    this.hide();
    for (i = 0; i < this._items.length; i += 1) {
        item = this._items[i];
        if (item instanceof StyledElements.MenuItem) {
            item.destroy();
        }
    }
    this._items = null;
    this._menuItemCallback = null;
    this._context = null;

    StyledElements.StyledElement.prototype.destroy.call(this);
};

/**
 *
 */
StyledElements.PopupMenu = function (options) {
    StyledElements.PopupMenuBase.call(this, options);

    this._disableCallback = EzWebExt.bind(function(event) {
        event.stopPropagation();
        event.preventDefault();
        this.hide();
    }, this);

    this._disableLayer = document.createElement('div');
    this._disableLayer.className = 'disable-layer';
    EzWebExt.addEventListener(this._disableLayer, "click", this._disableCallback, false);
    EzWebExt.addEventListener(this._disableLayer, "contextmenu", this._disableCallback, false);
};
StyledElements.PopupMenu.prototype = new StyledElements.PopupMenuBase({extending: true});

StyledElements.PopupMenu.prototype.show = function(refPosition) {
    document.body.appendChild(this._disableLayer);

    StyledElements.PopupMenuBase.prototype.show.call(this, refPosition);
}

StyledElements.PopupMenu.prototype.hide = function() {
    StyledElements.PopupMenuBase.prototype.hide.call(this);

    if (EzWebExt.XML.isElement(this._disableLayer.parentNode)) {
        EzWebExt.removeFromParent(this._disableLayer);
    }
}

StyledElements.PopupMenu.prototype.destroy = function() {
    EzWebExt.removeEventListener(this._disableLayer, "click", this._disableCallback, false);
    EzWebExt.removeEventListener(this._disableLayer, "contextmenu", this._disableCallback, false);
    this._disableCallback = null;

    StyledElements.PopupMenuBase.prototype.destroy.call(this);
}

/**
 *
 */
StyledElements.SubMenuItem = function(text, handler) {
    StyledElements.PopupMenuBase.call(this);

    this.menuItem = new StyledElements.MenuItem(text, handler);
    this.menuItem.addClassName('submenu');
}
StyledElements.SubMenuItem.prototype = new StyledElements.PopupMenuBase({extending: true});

StyledElements.SubMenuItem.prototype._getContext = function() {
    if (this.parentMenu instanceof StyledElements.SubMenuItem) {
        return this.parentMenu._getContext();
    } else {
        return this.parentMenu._context;
    }
}

StyledElements.SubMenuItem.prototype._menuItemCallback = function(menuItem) {
    var currentMenu = this;
    while (currentMenu.parentMenu) {
        currentMenu = currentMenu.parentMenu;
    }
    currentMenu.hide();
    menuItem.run(currentMenu._context);
}

StyledElements.SubMenuItem.prototype._setParentPopupMenu = function(popupMenu) {
    this.parentMenu = popupMenu;

    this.parentMenu.addEventListener('itemOver', EzWebExt.bind(function(popupMenu, item) {
        var position;

        if (item === this.menuItem) {
            position = EzWebExt.getRelativePosition(this.menuItem.wrapperElement, this.menuItem.wrapperElement.ownerDocument.body);
            position.x += this.menuItem.wrapperElement.offsetWidth;
            this.show(position);
        } else {
            this.hide();
        }
    }, this));
}

StyledElements.SubMenuItem.prototype._getMenuItem = function() {
    return this.menuItem;
}

StyledElements.SubMenuItem.prototype.addEventListener = function(eventId, handler) {
    switch (eventId) {
    case 'mouseover':
    case 'click':
        return this.menuItem.addEventListener(eventId, handler);
    default:
        return StyledElements.PopupMenuBase.prototype.addEventListener.call(this, eventId, handler);
    }
}

StyledElements.SubMenuItem.prototype.destroy = function() {
    if (this.menuItem) {
        this.menuItem.destroy();
    }
    this.menuItem = null;

    StyledElements.PopupMenuBase.prototype.destroy.call(this);
}

/**
 * @experimental
 *
 */
StyledElements.Separator = function Separator () {
    StyledElements.StyledElement.call(this, []);

    this.wrapperElement = document.createElement("hr");
};
StyledElements.Separator.prototype = new StyledElements.StyledElement();

StyledElements.Separator.prototype.destroy = function destroy () {
    if (EzWebExt.XML.isElement(this.wrapperElement.parentNode)) {
        EzWebExt.removeFromParent(this.wrapperElement);
    }

    StyledElements.StyledElement.prototype.destroy.call(this);
};
