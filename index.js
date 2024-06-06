const digests = ["sha1", "sha256", "sha512", "md5"]
const methods = ["readAsArrayBuffer", "readAsBinaryString", "readAsDataURL", "readAsText"]

function getContainer() {
    return document.querySelector("div.results")
}

const bufferToString = (buffer) => {
    const bytes = new Uint8Array(buffer)
    return bytes.reduce((string, byte) => (string + String.fromCharCode(byte)), "")
}

const generateDigestPromise = (file, digest) => {
    return new Promise((resolve) => {
        const fr = new FileReader();

        fr.onload = ({ target: { result } }) => {
            const container = forge.md[digest].create();
            container.update(result);
            resolve({ digest: container.digest().toHex(), method: "fileReader" })
        }

        fr.readAsBinaryString(file);
    })
}

const generateDigestAsync = async (file, digest) => {
    const buffer = await file.arrayBuffer()
    const result = bufferToString(buffer)
    const container = forge.md[digest].create()
    container.update(result)
    return { digest: container.digest().toHex(), method: "file" }
}

const printDigests = ({ target }) => {
    const [file] = target.files;
    window.file = file;
    const container = getContainer();
    let h = document.createElement("h1");
    h.innerHTML = "Message Digests";
    container.replaceChildren(h);

    digests.forEach(async (digest) => {
        const wrapper = document.createElement("div");
        const header = document.createElement("h2");
        header.innerHTML = digest;
        wrapper.appendChild(header);

        const results = await Promise.all([
            generateDigestPromise(file, digest),
            generateDigestAsync(file, digest)
        ])

        results.forEach(({ method, digest: result }) => {
            const element = document.createElement("p")
            element.innerHTML = `${method}: ${result}`
            wrapper.appendChild(element)
        })

        container.appendChild(wrapper);
    });
}

function ready() {
    const r = document.querySelector(`input[name="file"]`)
    r.addEventListener("change", printDigests)
}

window.addEventListener("DOMContentLoaded", ready)
