export default class Component {
    constructor (elem, props) {
        this.elem = elem
        this.props = props || {}
        this.state = {}
        this.name = this.constructor.name
    }

    emptyInnerHtml (elem) {
        while (elem.firstChild) {
            elem.removeChild(elem.lastChild)
        }
        return this
    }

    destroy () {
        while (this.elem.firstChild) {
            this.elem.removeChild(this.elem.lastChild)
        }
        return this
    }

    createElementFromHTML (htmlString) {
        const div = document.createElement('div')
        if (typeof htmlString == 'string') {
            div.innerHTML = htmlString.trim()
        }
        return div.firstChild
    }

    addHTML (str) {
        const elem = this.createElementFromHTML(str)
        this.elem.append(elem)
        return elem
    }

    addHTMLTo (toElem, str) {
        const elem = this.createElementFromHTML(str)
        toElem.append(elem)
        return elem
    }

    render () {
        throw new Error('render is not implemented')
    }
}
