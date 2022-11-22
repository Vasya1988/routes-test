const classes = {
    mapId: 'map',
    classMap: 'map',
    enterRoute: 'enterRoute',
    routes: 'routes'
}

const mapId = document.getElementById(classes.mapId);
// console.info(mapId)
const enterRouteNode = document.querySelector(`.${classes.enterRoute}`)
const routesNode = document.querySelector(`.${classes.routes}`)

const routesArray = []

const routeMarkup = (name) => {
    return `
        <div class="route">
        <span>${name}</span>
        <button>Close</button>
        </div>
    `
}

const mapRender = () => {

    ymaps.ready(() => {

        let myMap = new ymaps.Map(classes.mapId, {
            center: [55.76, 37.57],
            zoom: 9,
            controls: []
        })

        let multiRoute = new ymaps.multiRouter.MultiRoute(
            {
                referencePoints: routesArray
            },
            {
                boundsAutoApply: true
            }
        )

        myMap.geoObjects.add(multiRoute)
    })
}

mapRender()

// Добавляем маршрут из инпута
const addRoutes = () => {
    routesArray.push(event.target.value)
    routesNode.insertAdjacentHTML('beforeend', routeMarkup(event.target.value))
    event.target.value = ''
    console.log(routesArray)
    changeRoutes()
}

const changeRoutes = () => {
    if (routesArray.length > 1) {
        mapId.innerHTML = '';
        mapRender()
    }
}




enterRouteNode.addEventListener('change', addRoutes)
// routesNode.innerHTML = routesArray.map((name) => {routeMarkup(name)})