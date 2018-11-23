const BASE = 'https://visage.surgeplay.com'

export const Visage = {
    skin:   (uuid) => `${BASE}/skin/64/${uuid}`,
    avatar: (uuid) => `${BASE}/face/256/${uuid}`,
    head:   (uuid) => `${BASE}/head/256/${uuid}`,
    full:   (uuid) => `${BASE}/full/400/${uuid}`
}
