import Component from '../lib/Component'
import "@babel/polyfill";

export class DEVSWebviewerLinker extends Component {

    constructor(elem, props) {
        super(elem, props);
        this.state = {
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
        }
    }

    getId = id => `#${id}`

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
            // TODO
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
                                const card = this.addHTMLTo(
                                    cardsContainer,
                                    `<div id="${key}-${index}" class="card m-1 p-4 dwl-pointer dwl-card">${this.getCardContent(key, item)}</div`
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
                        const card = this.addHTMLTo(
                            cardsContainer,
                            `<div id="${key}-${index}" class="card m-1 p-4 dwl-pointer dwl-card">${this.getCardContent(key, item)}</div`
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
                    d3.select(this).attr('id', `e-${index}`);
                }
            })
            .on('click', function() {
                const id = self.getId(d3.select(this).attr('id'))
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
                const id = self.getId(d3.select(this).attr('id'))
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
        buttons[0].click()
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
    }

}
