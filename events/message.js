export default function(msg) {
    for (let i = 0; i < this.categories.length; i++) {
        if (msg.content.toLowerCase().startsWith(this.categories[i].prefix))
            return this.categories[i].process(msg);
    }
}