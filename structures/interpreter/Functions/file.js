export default function (url, name) {
    if (!name)
        name = 'unknown.png'
    else
        name = this.interpret(name)

    url = this.interpret(url)

    this.files.push({ attachment: url, name })
    
    return ''
};
