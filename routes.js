const classes = {
    container: 'container',
    navigation: 'nav',
    mapId: 'map',
    classMap: 'map',
    enterRoute: 'enterRoute',
    routes: 'routes',
    route: 'route',
    activeUp: 'route--active-up',
    activeDown: 'route--active-down',
    placeholder: 'placeholder',
    buttonClose: 'close'
}
class Routes {
    constructor(element, option = {}) {

        this.container = element

        // Array with routes
        this.routesArray = ['Пушкино', 'Москва', 'Подольск'] // 

        this.ifRoutesHaveChanged = false

        // Ссылка, куда будем скидывать перетаскиваемый элемент
        this.currentDroppAble = null

        // Bind functions
        this.manageHTML = this.manageHTML.bind(this)
        this.mapRender = this.mapRender.bind(this)
        this.setEvents = this.setEvents.bind(this)
        this.addRoute = this.addRoute.bind(this)
        this.setParameters = this.setParameters.bind(this)
        this.changeRoutes = this.changeRoutes.bind(this)
        this.dragStart = this.dragStart.bind(this)
        this.dropped = this.dropped.bind(this)
        this.moveAt = this.moveAt.bind(this)
        this.moving = this.moving.bind(this)
        this.dropOnElement = this.dropOnElement.bind(this)
        this.replaceRoutes = this.replaceRoutes.bind(this)
        this.deleteRoute = this.deleteRoute.bind(this)

        // Run functions
        this.manageHTML()
        this.setEvents()
        this.setParameters()
    }
    manageHTML() {
        this.container.innerHTML = 
            `
                <div class=${classes.container}>
                    <div class=${classes.navigation}>
                        <input type="text" class=${classes.enterRoute}>
                        <div class=${classes.routes}>
                        </div>
                    </div>
                    <div class=${classes.classMap}>
                        <div id=${classes.mapId}></div>
                    </div>
                </div>
            `;
        this.mapRender()

        // Map ID node
        this.mapIdNode = document.getElementById(classes.mapId);
        // Input route node
        this.enterRouteNode = document.querySelector(`.${classes.enterRoute}`);
        // Routes node
        this.routesNode = document.querySelector(`.${classes.routes}`)

        // help
        if (this.routesArray.length != 0) {
            this.routesArray.map((name) => {
                this.routesNode.insertAdjacentHTML('beforeend', routeMarkup(name))
            })
        }
    }
    setParameters() {
    }
    setEvents() {
        // Get input value of route
        this.enterRouteNode.addEventListener('change', this.addRoute)
        this.routeNode = Array.from(this.routesNode.children)
        this.routeNode.map((route, index) => {
            this.index = index
            route.addEventListener('pointerdown', this.dragStart)
        })
        document.querySelectorAll('.close').forEach((item) => {
            item.addEventListener('click', this.deleteRoute)
        })
        document.querySelectorAll('.routeValue').forEach((item, index) => {
            item.addEventListener('change', (e) => {
                if (e.target.value !== this.routesArray[index]) {
                    // console.log(e.target.value, index)
                    // console.log(this.routesArray[index])
                    this.replaceRoutes()
                }
            })
        })
        window.addEventListener('pointercancel', this.dropped)

        console.log('Set events')
    }

    // Render of the map on the page
    mapRender = () => {
        ymaps.ready(() => {
    
            let myMap = new ymaps.Map(classes.mapId, {
                center: [55.76, 37.57],
                zoom: 9,
                controls: []
            })
    
            let multiRoute = new ymaps.multiRouter.MultiRoute(
                {
                    referencePoints: this.routesArray
                },
                {
                    boundsAutoApply: true
                }
            )
    
            myMap.geoObjects.add(multiRoute)
        })
    }

    // Add route form input
    addRoute() {
        this.routesArray.push(event.target.value)
        this.routesNode.insertAdjacentHTML('beforeend', routeMarkup(event.target.value))
        event.target.value = ''
        this.changeRoutes()
        this.setEvents()
        console.log(this.routesArray)
    }
    // Обновляем маршруты на карте
    changeRoutes() {
        this.mapIdNode.innerHTML = '';
        this.mapRender();
    }
    // Событие pointerdown
    dragStart(event) {
        // Если на кнопку удалить маршрут, удаляем событие pointerup, что бы ренедр карты не задваивался, потому что ф-я обновления маршрута есть в pointerup и button delete
        if (
            event.target.className === 'close' || 
            event.target.className === 'routeValue' ||
            event.target.className === 'routeZone'
        )  {
            this.routeNode.map((route, index) => {
                route.removeEventListener('pointerup', this.dropped)
            })
            return
        }
        this.currentWidth = event.target
        console.log(this.currentWidth.style)
        // Добавляем 6px, при клике в верхней части блока с маршрутом, мышка может выходить за пределы блока (из-за margin 6px), когда это происходит, отменяем все дальнейшие события
        if (event.pageY < event.target.getBoundingClientRect().top + 6) return

        // Добавляем событие Pointerup
        event.target.addEventListener('pointerup', this.dropped)
        this.startClick = event;
        this.startClick.target.style.cursor = 'grabbing'
        this.ifRoutesHaveChanged = false

        // Берем координаты event от верхнего левого угла
        this.coordinatesEvent = event.target.getBoundingClientRect()

        // Создаем элемент Placeholder
        this.placeholderNode = document.createElement('div')
        this.placeholderNode.classList.add(classes.placeholder)

        // Получаем индекс от event.target
        this.eventIndex = Array.from(event.target.parentNode.children).indexOf(event.target);
        // console.log('Start INDEX --> ', this.eventIndex)

        // Заменяем на тот, по которому кликнули
        this.startClick.target.replaceWith(this.placeholderNode)

        // Из расстояния от мыши до экрана (clientY/X)
        // Вычитаем координаты из Placeholder
        // Что бы курсор не сдвигался в центр перетаскиваемого элемента
        this.shiftX = event.clientX - this.coordinatesEvent.left
        this.shiftY = event.clientY - this.coordinatesEvent.top

        // Настраиваем движущийся элемент и добавляем в body
        this.startClick.target.style.position = 'absolute'
        this.startClick.target.style.zIndex = 1000
        // min-width: 769px
        window.outerWidth < 769 ? this.startClick.target.style.width = '80%' : true
        console.log(window.outerWidth)
        

        document.body.append(this.startClick.target)

        // Задаем координаты элементу, который двигаем
        // Что бы его top и left не ушли в ноль, после смены position на absolute
        this.startClick.target.style.left = `${this.coordinatesEvent.x}px`
        this.startClick.target.style.top = `${this.coordinatesEvent.y}px`

        // console.log('Start --> ', event.currentTarget)

        document.addEventListener('pointermove', this.moving)
    }
    // Ф-я двигает элемент
    moveAt(pageX, pageY) {
        this.startClick.target.style.left = `${pageX - this.shiftX}px`
        this.startClick.target.style.top = `${pageY - this.shiftY}px`
    }
    // Ф-я для event pointermove, двигать наш элемент
    moving(event) {
        if (event.clientX < 0 || event.clientY < 0) {
            this.dropped()
            return
        }
        this.moveAt(event.pageX, event.pageY)
        // Скрываем движущийся элемент, что бы получить координаты
        // элемента над которым мы проходим
        this.startClick.target.style.display = 'none'
        
        // получаем координаты
        let elemBelow = document.elementFromPoint(event.clientX, event.clientY)

        // Возращаем видимость элемента
        this.startClick.target.style.display = 'flex'
        this.startClick.target.hidden = false

        // Если курсор за передлами окна
        if (!elemBelow) return

        // Получаем элемент на который будем переносить
        let droppableBelow = elemBelow.closest('.route')

        // Если мы еще не были над нужным элементом
        if (this.currentDroppAble != droppableBelow) {
            this.ifRoutesHaveChanged = true
            // Если уже были и ушли, удаляем действия
            if (this.currentDroppAble) {
                // console.log('We leave')
            }
            // Если нашли нужный элемент, добавляем в currentDroppAble
            this.currentDroppAble = droppableBelow
            // Если только зашли на элемента для dropp
            if (this.currentDroppAble) {
                
                // Индекс элемента на который будем дропать
                this.droppableBelowIndex = Array.from(droppableBelow.parentNode.children).indexOf(droppableBelow);
                
                // console.log('We came')
                // console.log(this.eventIndex, this.droppableBelowIndex, this.ifRoutesHaveChanged)
                this.dropOnElement(this.eventIndex, this.droppableBelowIndex)
            }
        }
    }
    // Ф-я для event Pointerup
    dropped() {
        if (!this.startClick) return
        document.removeEventListener('pointermove', this.moving)
        // Если не было dropp, возвращаем элемент на место
        this.placeholderNode.replaceWith(this.startClick.target)
        this.startClick.target.style.position = 'inherit'
        this.startClick.target.style.top = '0'
        this.startClick.target.style.left = '0'
        // this.startClick.target.style.width = 'auto'

        // Проверка, что бы карта рендерилась без изменений маршрута
        if (this.ifRoutesHaveChanged) {
            this.placeholderNode.remove()
            this.replaceRoutes()
            this.ifRoutesHaveChanged = false
        }
        this.startClick.target.style.cursor = 'grab'
    }
    dropOnElement(drag, drop) {
        if (drag < drop) {
            this.ifRoutesHaveChanged = true
            // console.log(drag, drop)
            this.currentDroppAble.insertAdjacentElement('afterend', this.placeholderNode)
            this.eventIndex = this.eventIndex + 1

        } 
        if (drag > drop) {
            this.currentDroppAble.insertAdjacentElement('beforebegin', this.placeholderNode)
            this.eventIndex = this.eventIndex - 1
        }
        if (drag === drop) {
            this.currentDroppAble.insertAdjacentElement('beforebegin', this.placeholderNode)
        }
    }
    replaceRoutes() {
        this.routesArray = [];
        let newRoute = Array.from(this.routesNode.children)
        newRoute.map((e) => {
            this.routesArray.push(e.querySelector('.routeValue').value)
        })
        console.log(this.routesArray)
        this.changeRoutes()
    }
    deleteRoute() {
        event.target.closest('.route').remove()
        this.replaceRoutes()
        console.log("delete --> ")
    }

}

// ----------- Helpers
const routeMarkup = (name) => {
    return `
        <div class="route" >
            <div class="dragZone" ></div>
            <div class="routeZone" >
                <input class="routeValue" type="text" value="${name}">
                <button class="close" >Close</button>
            </div>
        </div>
    `
    // <input class="routeValue" type="text" value="${name}">
}


