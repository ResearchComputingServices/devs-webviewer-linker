import Component from '../lib/Component'
import "@babel/polyfill";

export class DEVSWebviewerLinker extends Component {

    constructor(elem, props) {
        super(elem, props);
        this.state = {
            buttons: [],
            jsonContent: null,
            selectedSvgElements: {},
            currentButtonPicker: '',
            currentCardId: null,
            allowedButtons: {
                all: 'all',
                nodes: 'nodes',
                ports: 'output ports',
                links: 'links',
            },
            svgIdMap: new Set()
        }
    }

    parseId = id => `#${id}`

    getJsonContent = (id) => {
        const [key, str_index] = id.split('-');
        const index = parseInt(str_index);
        return this.state.jsonContent[key][index];
    }

    createAssociation = () => {
        const selectedSvgElements = this.state.selectedSvgElements
        const currentCardId = this.state.currentCardId
        if (currentCardId) {
            const jsonElement = this.getJsonContent(this.state.currentCardId)
            jsonElement.svg = Object.keys(selectedSvgElements).map(id => id)
            const warningIconId = `warning-icon-${currentCardId}`
            if (jsonElement.svg.length === 0) {
                document.getElementById(warningIconId).classList.remove('invisible')
                document.getElementById(warningIconId).classList.add('visible')
            } else {
                document.getElementById(warningIconId).classList.remove('visible')
                document.getElementById(warningIconId).classList.add('invisible')
            }
        }
    }

    getJson = () => {
        return this.state.jsonContent
    }

    getSvg = () => {
        return document.getElementById('svg-container').innerHTML
    }

    parseProps = async (props) => {
        return {
            jsonContent: await this.readFileAsJson(props.jsonFile),
            svgContent: await this.readFileAsText(props.svgFile),
        }
    }

    onCardClick = () => {
        this.destroy()
    }

    readFileAsJson = async file => {
        const text = await file.text();
        return JSON.parse(text);
    };

    readFileAsText = file => new Promise(resolve => {
        const fileReader = new FileReader();
        fileReader.onload = () => resolve(fileReader.result);
        fileReader.readAsText(file);
    });

    getCardContent = (buttonName, item) => {
        let contents = ''
        if (typeof item === 'object') {
            for (const key in item) {
                if (buttonName === 'ports' && key === 'type') {
                    continue;
                }
                const value = item[key]
                contents += `<div class="p-1">
                    <b>${key}</b>: ${value}
                </div>`
            }
        }
        return contents
    }

    clearSvgSelections = () => {
        const self = this;
        const ids = Object.keys(self.state.selectedSvgElements)
        for (const id of ids) {
            const elem = d3.select(id)
            if (elem && elem.size() !== 0) {
                elem.attr('stroke', self.state.selectedSvgElements[id].stroke);
            }
        }
        this.setState((s) => ({
            ...s,
            selectedSvgElements: {}
        }))
    }

    onCardClick = (selectedCard) => {
        this.clearSvgSelections()
        var cards = document.getElementById('json-container').querySelectorAll('div');
        for (const card of cards) {
            const id = selectedCard.getAttribute('id')
            if (id === card.getAttribute('id')) {
                if (this.state.currentCardId === id) {
                    this.setState(s => ({
                        ...s,
                        currentCardId: null
                    }))
                    card.classList.remove('dwl-highlight-card')
                } else {
                    this.setState(s => ({
                        ...s,
                        currentCardId: id
                    }))
                    card.classList.add('dwl-highlight-card')
                    const jsonContent = this.getJsonContent(id)
                    if (Array.isArray(jsonContent.svg)) {
                        jsonContent.svg.forEach(id => {
                            const elem = d3.select(id)
                            if (elem && elem.size() !== 0) {
                                const selections = { ...this.state.selectedSvgElements }
                                selections[id] = { id, stroke: elem.attr('stroke')};
                                this.setState(s => ({
                                    ...s,
                                    selectedSvgElements: selections
                                }))
                                elem.attr('stroke', 'tomato');
                            }
                        })
                    }
                }
            } else {
                card.classList.remove('dwl-highlight-card')
            }
        }
    }

    showIcon = (svg, id) => {
        const hasAssociation = svg.some(id => this.state.svgIdMap.has(id))
        return `
            <svg id="${id}" style="position:absolute;right:3;bottom:3" class="${hasAssociation ? 'invisible' : 'visible'} warning-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-exclamation-triangle" viewBox="0 0 16 16">
              <path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.146.146 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.163.163 0 0 1-.054.06.116.116 0 0 1-.066.017H1.146a.115.115 0 0 1-.066-.017.163.163 0 0 1-.054-.06.176.176 0 0 1 .002-.183L7.884 2.073a.147.147 0 0 1 .054-.057zm1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566z"/>
              <path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995z"/>
            </svg>
        `
    }

    onJsonButtonPicker = (cardsContainer, buttons, key, jsonContent) => {
        if (key !== this.state.currentButtonPicker) {
            this.clearSvgSelections()
            this.emptyInnerHtml(cardsContainer)
            this.setState(s => ({
                ...s,
                currentButtonPicker: key
            }))
            if (key == 'all') {
                for (const key in jsonContent) {
                    if (key in this.state.allowedButtons) {
                        const slice = jsonContent[key]
                        if (Array.isArray(slice)) {
                            slice.forEach((item, index) => {
                                const jsonElem = jsonContent[key][index]
                                const card = this.addHTMLTo(
                                    cardsContainer,
                                    `<div style="position:relative" id="${key}-${index}" class="card m-1 p-4 dwl-pointer dwl-card">
                                        ${this.getCardContent(key, item)}
                                        ${this.showIcon(Array.isArray(jsonElem.svg) ? jsonElem.svg : [], `warning-icon-${key}-${index}`)}
                                    </div`
                                )
                                card.addEventListener('click', () => {
                                    this.onCardClick(card)
                                }, false);
                            })
                        }
                    }
                }
            } else {
                const slice = jsonContent[key]
                if (Array.isArray(slice)) {
                    slice.forEach((item, index) => {
                        const jsonElem = jsonContent[key][index]
                        const card = this.addHTMLTo(
                            cardsContainer,
                            `<div style="position:relative" id="${key}-${index}" class="card m-1 p-4 dwl-pointer dwl-card">
                                ${this.getCardContent(key, item)}
                                ${this.showIcon(Array.isArray(jsonElem.svg) ? jsonElem.svg : [], `warning-icon-${key}-${index}`)}
                            </div`
                        )
                        card.addEventListener('click', () => {
                            this.onCardClick(card)
                        }, false);
                    })
                }
            }
            for (const button of buttons) {
                const buttonName = button.getAttribute('data-button-type')
                button.classList.remove('btn-secondary')
                if (buttonName === key) {
                    button.classList.add('btn-primary')
                } else {
                    button.classList.add('btn-secondary')
                }
            }
        }
    }

    renderSvg = (svgContainer, svgContent) => {
        this.addHTMLTo(svgContainer, svgContent)
        const self = this;
        d3.select('svg')
            .select('g')
            .selectAll('*')
            .each(function(_, index) {
                const existingId = d3.select(this).attr('id');
                if (!existingId) {
                    const id =`e-${index}` 
                    d3.select(this).attr('id', id);
                    self.state.svgIdMap.add(`#${id}`)
                } else {
                    self.state.svgIdMap.add(`#${existingId}`)
                }
            })
            .on('click', function() {
                const id = self.parseId(d3.select(this).attr('id'))
                if (id in self.state.selectedSvgElements) {
                    const selections = { ...self.state.selectedSvgElements };
                    d3.select(this).attr('stroke', selections[id].stroke);
                    delete selections[id];
                    self.setState(s => ({ ...s, selectedSvgElements: selections }))
                } else {
                    const selections = { ...self.state.selectedSvgElements };
                    const elem = d3.select(this);
                    selections[id] = { id, stroke: elem.attr('stroke')};
                    self.setState(s => ({ ...s, selectedSvgElements: selections }))
                    elem.attr('stroke', 'tomato');
                }
                self.createAssociation()
            })
            .each(function() {
                const id = self.parseId(d3.select(this).attr('id'))
                if (id in self.state.selectedSvgElements) {
                    d3.select(this).attr('stroke', 'tomato');
                }
            })
            .attr('pointer-events', 'fill')
            .style('cursor', 'pointer');
    }

    renderJson = (container, jsonContent) => {
        let buttonNames = Object.keys(jsonContent)
        const buttons = []
        const buttonContainer = this.addHTMLTo(container, `<div class="p-2" />`)
        const cardsContainer = this.addHTMLTo(container, `<div class="d-flex flex-row flex-wrap justify-content-center align-content-flex-start overflow-auto" />`)
        buttonNames = ['all'].concat(buttonNames)
        buttonNames.forEach(buttonName => {
            if (buttonName in this.state.allowedButtons) {
                const button = this.addHTMLTo(
                    buttonContainer,
                    `<button type="button" class="btn btn-secondary m-1" data-button-type="${buttonName}">${this.state.allowedButtons[buttonName]}</button>`
                )
                buttons.push(button)
                button.addEventListener('click', () => {
                    this.onJsonButtonPicker(cardsContainer, buttons, buttonName, jsonContent)
                }, false);
            }
        })
        this.setState(s => ({
            ...s,
            buttons,
        }))
    }

    render = async () => {
        const { jsonContent, svgContent } = await this.parseProps(this.props)
        this.setState(s => ({
            ...s,
            jsonContent,
        }))
        const container = this.addHTML("<div class='d-flex flex-row h-100 w-100' />")
        const jsonContainer = this.addHTMLTo(container, '<div id="json-container" class="d-flex flex-column card h-100 w-100" />')
        const svgContainer = this.addHTMLTo(container, '<div id="svg-container" class="card m-1 h-100 w-100" style="position:relative;" />')
        this.renderJson(jsonContainer, jsonContent)
        this.renderSvg(svgContainer, svgContent)
        this.state.buttons[0].click()
    }

}
