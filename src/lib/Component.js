export default class Component {
    constructor (elem, props) {
        this.elem = elem
        this.props = props || {}
        this.state = {}
        this.name = this.constructor.name
    }

    setState (state) {
        if (typeof state === 'function') {
            this.state = state(this.state)
        } else if (typeof state === 'object') {
            this.state = state
        }
    }

    setCacheItem (key, value) {
        window.localStorage.setItem(`${this.name}-${key}`, value)
    }

    getCacheItem (key) {
        window.localStorage.getItem(`${this.name}-${key}`)
    }

    emptyInnerHtml (elem) {
        while (elem.firstChild) {
            elem.removeChild(elem.lastChild)
        }
    }

    destroy () {
        while (this.elem.firstChild) {
            this.elem.removeChild(this.elem.lastChild)
        }
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
