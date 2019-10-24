const needsFallback = () => !window.IntersectionObserver


/** @param {HTMLImageElement} imgElement */
const renderImg = imgElement => {
    if (imgElement.dataset.srcset) imgElement.srcset = imgElement.dataset.srcset
    if (imgElement.dataset.src) imgElement.src = imgElement.dataset.src
}


export const runLazyloader = () => {
    if (typeof window === 'undefined') return

    const lazyElements = [...document.querySelectorAll('[data-srcset], [data-src]')]
    if (needsFallback()) return lazyElements.map(renderImg)

    const IO = new IntersectionObserver(
        entries => entries.forEach(({ isIntersecting, target }) => {
            if (isIntersecting) renderImg(target)
        }),
    )

    lazyElements.map(IO.observe.bind(IO))
}
