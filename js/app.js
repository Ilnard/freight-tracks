// Создание глобального хранилища данных
const store = Vuex.createStore({
    state() {
        return {
            user: {},
            generalOrdersAllRecieved: false,
            orders: [],
            generalOrdersCount: 5,
            generalOrdersCountSkipDifference: 5,
            sortGeneralOrders: null,
            filterGeneralOrders: null,
            notifs: [],
            lastNotifId: 1
        }
    },
    mutations: {
        setUserData(state, userData) {
            state.user = userData
        },
        setGeneralOrdersAllRecieved(state, all) {
            state.generalOrdersAllRecieved = all
        },
        setOrders(state, orders) {
            state.orders = state.orders.concat(orders)
        },
        increaseGeneralOrdersCount(state) {
            state.generalOrdersCount += 5
        },
        setSortGeneralOrders(state, sortData) {
            state.sortGeneralOrders = sortData
        },
        setFilterGeneralOrders(state, filterData) {
            state.filterGeneralOrders = filterData
        },
        switchOrderStatus(state, orderParams) {
            let orderIndex = state.orders.findIndex(order => order.id == orderParams.id)
            state.orders[orderIndex].status = orderParams.status
        },
        setAcceptDate(state, orderParams) {
            let orderIndex = state.orders.findIndex(order => order.id == orderParams.id)
            state.orders[orderIndex].acceptDate = orderParams.acceptDate
        },
        setFor(state, orderParams) {
            let orderIndex = state.orders.findIndex(order => order.id == orderParams.id)
            state.orders[orderIndex].for = orderParams.for
        },
        deleteOrder(state, id) {
            let orderIndex = state.orders.findIndex(order => order.id == id)
            state.orders.splice(orderIndex, 1)
        },
        setCompleteDate(state, orderParams) {
            let orderIndex = state.orders.findIndex(order => order.id == orderParams.id)
            state.orders[orderIndex].completeDate = orderParams.completeDate
        },
        addNotif(state, notif) {
            state.notifs.push(notif)
        },
        increaseLastNotifId(state) {
            state.lastNotifId++
        },
        deleteNotif(state, notifId) {
            state.notifs.splice(state.notifs.findIndex(notif => notif.id == notifId), 1)
        }
    },
    actions: {
        async fetchUserData() {
            const data = await fetch('../api/get-user-data.php', {
                method: 'get',
                headers: {
                    "Content-Type": "application/json; charset=utf-8"
                }
            })
                .then(response => response.json())
                .then(data => {
                    store.commit('setUserData', data)
                })
            return data
        },
        fetchOrders(store, generalMore) {
            if (generalMore) store.commit('increaseGeneralOrdersCount')
            fetch('../api/get-orders.php', {
                method: 'post',
                body: JSON.stringify({
                    generalCount: store.state.generalOrdersCount,
                    generalCountSkipDifference: store.state.generalOrdersCountSkipDifference,
                    generalMore: generalMore
                }),
                headers: {
                    "Content-Type": "application/json; charset=utf-8"
                }
            })
                .then(response => response.json())
                .then(data => {
                    let orders = data.orders
                    let processed_orders = []
                    for (let i = 0; i < orders.length; i++) {
                        if (store.state.orders.findIndex(order => order.id == orders[i].id) != -1) {
                            store.commit('setFor', {
                                id: orders[i].id,
                                for: 'market'
                            })
                        }
                        else {
                            orders[i].dateFrom = new Date(new Date(orders[i].dateFrom).getTime() - 1000 * 60 * 60 * 3 - new Date().getTimezoneOffset() * 60 * 1000)
                            orders[i].dateTo = new Date(new Date(orders[i].dateTo).getTime() - 1000 * 60 * 60 * 3 - new Date().getTimezoneOffset() * 60 * 1000)
                            orders[i].createDate = new Date(new Date(orders[i].createDate).getTime() - 1000 * 60 * 60 * 3 - new Date().getTimezoneOffset() * 60 * 1000)
                            if (orders[i].acceptDate) orders[i].acceptDate = new Date(new Date(orders[i].acceptDate).getTime() - 1000 * 60 * 60 * 3 - new Date().getTimezoneOffset() * 60 * 1000)
                            processed_orders.push(orders[i])
                        }


                    }
                    store.commit('setOrders', processed_orders)
                    store.commit('setGeneralOrdersAllRecieved', data.generalAll)
                })
        },
        createNotif(store, notifText) {
            if (notifText != '') {
                id = store.state.lastNotifId
                store.commit('addNotif', {
                    id: id,
                    text: notifText
                })
                store.commit('increaseLastNotifId')
            }
        }
    },
    getters: {
        getUserData: state => state.user,
        getGeneralOrders: state => {
            let orders = state.orders.filter(order => order.view == 'public' && order.status == 'search' && order.for == 'market').sort((order1, order2) => order1.createDate > order2.createDate ? 1 : -1)
            if (state.sortGeneralOrders) {
                switch (state.sortGeneralOrders.sortItem) {
                    case 'date-from': {
                        orders.sort((order1, order2) => {
                            switch (state.sortGeneralOrders.sortDirection) {
                                case 'from': {
                                    return order1.dateFrom > order2.dateFrom ? 1 : -1
                                }
                                case 'to': {
                                    return order1.dateFrom < order2.dateFrom ? 1 : -1
                                }
                            }
                        })
                        break
                    }
                    case 'date-to': {
                        orders.sort((order1, order2) => {
                            switch (state.sortGeneralOrders.sortDirection) {
                                case 'from': {
                                    return order1.dateTo > order2.dateTo ? 1 : -1
                                }
                                case 'to': {
                                    return order1.dateTo < order2.dateTo ? 1 : -1
                                }
                            }
                        })
                        break
                    }
                    case 'price': {
                        orders.sort((order1, order2) => {
                            switch (state.sortGeneralOrders.sortDirection) {
                                case 'from': {
                                    return order1.price > order2.price ? 1 : -1
                                }
                                case 'to': {
                                    return order1.price < order2.price ? 1 : -1
                                }
                            }
                        })
                        break
                    }
                }
            }
            if (state.filterGeneralOrders) {
                // Проверка заявки на соответствие фильтрам
                orders = orders.filter(order => {
                    let response = true
                    if (state.filterGeneralOrders.townFrom) {
                        if (state.filterGeneralOrders.townFrom != order.townFrom) response = false
                    }
                    if (state.filterGeneralOrders.townTo) {
                        if (state.filterGeneralOrders.townTo != order.townTo) response = false
                    }
                    if (state.filterGeneralOrders.priceFrom) {
                        if (order.price < Number(state.filterGeneralOrders.priceFrom)) response = false
                    }
                    if (state.filterGeneralOrders.priceTo) {
                        if (order.price > Number(state.filterGeneralOrders.priceTo)) response = false
                    }
                    if (state.filterGeneralOrders.dateFrom) {
                        let orderDate = new Date(order.dateFrom).setHours(5, 0, 0, 0)
                        orderTimestamp = new Date(orderDate).getTime()
                        let filterDate = new Date(state.filterGeneralOrders.dateFrom).setHours(5, 0, 0, 0)
                        filterTimestamp = new Date(filterDate).getTime()
                        if (orderTimestamp != filterTimestamp) response = false
                    }
                    if (state.filterGeneralOrders.dateTo) {
                        let orderDate = new Date(order.dateTo).setHours(5, 0, 0, 0)
                        orderTimestamp = new Date(orderDate).getTime()
                        let filterDate = new Date(state.filterGeneralOrders.dateTo).setHours(5, 0, 0, 0)
                        filterTimestamp = new Date(filterDate).getTime()
                        if (orderTimestamp != filterTimestamp) response = false
                    }
                    if (state.filterGeneralOrders.weight) {
                        if ((state.filterGeneralOrders.weight != order.weight || state.filterGeneralOrders.weightUnit != order.weightUnit)) response = false
                    }
                    if (state.filterGeneralOrders.volume) {
                        if (order.volume != state.filterGeneralOrders.volume) response = false
                    }
                    if (state.filterGeneralOrders.height) {
                        if (order.height != state.filterGeneralOrders.height) response = false
                    }
                    if (state.filterGeneralOrders.perish) {
                        if (order.perish != state.filterGeneralOrders.perish) response = false
                    }
                    if (state.filterGeneralOrders.fragil) {
                        if (order.fragil != state.filterGeneralOrders.fragil) response = false
                    }
                    return response
                })
            }
            return orders
        },
        getGeneralOrdersAllRecieved: state => state.generalOrdersAllRecieved,
        getPersonalOrders: state => state.orders.filter(order => order.view == 'private' && order.status == 'search'),
        getAcceptedOrders: state => state.orders.filter(order => order.status == 'accepted').sort((order1, order2) => order1.acceptDate > order2.acceptDate ? -1 : 1),
        getCompletedOrders: state => state.orders.filter(order => order.status == 'completed').sort((order1, order2) => order1.completeDate > order2.completeDate ? -1 : 1),
        getOrdersInSearch: state => state.orders.filter(order => order.clientId == state.user.id && order.status == 'search'),
        getAcceptedClientOrders: state => state.orders.filter(order => order.clientId == state.user.id && order.status == 'accepted').sort((order1, order2) => order1.acceptDate > order2.acceptDate ? -1 : 1),
        getArchiveOrders: state => state.orders.filter(order => order.clientId == state.user.id && order.status == 'completed').sort((order1, order2) => order1.completeDate > order2.completeDate ? -1 : 1),
        getOrder: state => id => state.orders.find(order => order.id == id),
        getNotifs: state => state.notifs,
        getNotif: state => id => state.notifs.find(notif => notif.id == id),
        getLastNotifId: state => state.lastNotifId
    }
})

// Компоненты
const Header = {
    data() {
        return {
            dropdownOpened: false
        }
    },
    methods: {
        dropdownOpen() {
            this.dropdownOpened = !this.dropdownOpened
        }
    },
    template: `
    <header class="header br10">
        <div class="container">
            <div class="header__inner">
                <svg class="logo" width="160" height="60" viewBox="0 0 160 61" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path class="default-fill"
                        d="M32.9472 35.256C32.9472 38.304 32.0112 40.776 30.1392 42.672C28.2672 44.544 25.7592 45.756 22.6152 46.308V48.18C22.6152 48.444 22.5192 48.672 22.3272 48.864C22.1352 49.056 21.9072 49.152 21.6432 49.152H16.0272C15.7632 49.152 15.5352 49.056 15.3432 48.864C15.1512 48.672 15.0552 48.444 15.0552 48.18V46.272C11.9592 45.696 9.48716 44.448 7.63916 42.528C5.81516 40.608 4.90316 38.184 4.90316 35.256C4.90316 32.328 5.82716 29.964 7.67516 28.164C9.54716 26.34 12.0072 25.152 15.0552 24.6V21.936C15.0552 21.672 15.1512 21.444 15.3432 21.252C15.5352 21.06 15.7632 20.964 16.0272 20.964H21.6432C21.9072 20.964 22.1352 21.06 22.3272 21.252C22.5192 21.444 22.6152 21.672 22.6152 21.936V24.6C25.7352 25.128 28.2312 26.304 30.1032 28.128C31.9992 29.952 32.9472 32.328 32.9472 35.256ZM12.2832 35.256C12.2832 37.728 13.2672 39.372 15.2352 40.188V30.684C13.2672 31.476 12.2832 33 12.2832 35.256ZM25.3872 35.292C25.3872 33.084 24.4032 31.548 22.4352 30.684V40.188C23.3472 39.852 24.0672 39.264 24.5952 38.424C25.1232 37.584 25.3872 36.54 25.3872 35.292ZM53.0931 22.8C55.3491 22.8 57.3171 23.184 58.9971 23.952C60.6771 24.72 61.9611 25.764 62.8491 27.084C63.7371 28.404 64.1811 29.88 64.1811 31.512C64.1811 34.2 63.3411 36.312 61.6611 37.848C59.9811 39.36 57.1251 40.116 53.0931 40.116H48.3411V47.028C48.3411 47.292 48.2451 47.52 48.0531 47.712C47.8611 47.904 47.6331 48 47.3691 48H39.6291C39.3651 48 39.1371 47.904 38.9451 47.712C38.7531 47.52 38.6571 47.292 38.6571 47.028V23.772C38.6571 23.508 38.7531 23.28 38.9451 23.088C39.1371 22.896 39.3651 22.8 39.6291 22.8H53.0931ZM52.9491 33.456C53.5251 33.456 53.9811 33.288 54.3171 32.952C54.6531 32.592 54.8211 32.124 54.8211 31.548C54.8211 30.948 54.6531 30.456 54.3171 30.072C53.9811 29.688 53.5251 29.496 52.9491 29.496H48.3771V33.456H52.9491ZM74.823 46.776C74.511 47.592 73.971 48 73.203 48H66.399C66.183 48 65.991 47.928 65.823 47.784C65.679 47.616 65.607 47.424 65.607 47.208L65.643 46.992L73.491 23.988C73.587 23.676 73.767 23.4 74.031 23.16C74.295 22.92 74.655 22.8 75.111 22.8H85.119C85.575 22.8 85.935 22.92 86.199 23.16C86.463 23.4 86.643 23.676 86.739 23.988L94.587 46.992L94.623 47.208C94.623 47.424 94.539 47.616 94.371 47.784C94.227 47.928 94.047 48 93.831 48H87.027C86.259 48 85.719 47.592 85.407 46.776L84.507 44.256H75.723L74.823 46.776ZM80.115 29.748L77.559 37.236H82.671L80.115 29.748ZM153.599 22.8C153.863 22.8 154.091 22.896 154.283 23.088C154.475 23.28 154.571 23.508 154.571 23.772V29.568C154.571 29.832 154.475 30.06 154.283 30.252C154.091 30.444 153.863 30.54 153.599 30.54H145.859V47.028C145.859 47.292 145.763 47.52 145.571 47.712C145.379 47.904 145.151 48 144.887 48H137.471C137.207 48 136.979 47.904 136.787 47.712C136.595 47.52 136.499 47.292 136.499 47.028V30.54H128.759C128.495 30.54 128.267 30.444 128.075 30.252C127.883 30.06 127.787 29.832 127.787 29.568V23.772C127.787 23.508 127.883 23.28 128.075 23.088C128.267 22.896 128.495 22.8 128.759 22.8H153.599Z" />
                    <path class="accent-fill"
                        d="M123.949 46.812C124.021 46.884 124.057 46.98 124.057 47.1C124.057 47.34 123.973 47.556 123.805 47.748C123.661 47.916 123.481 48 123.265 48H115.525C114.877 48 114.385 47.724 114.049 47.172L110.557 41.808L107.137 47.172C106.777 47.724 106.285 48 105.661 48H97.885C97.669 48 97.477 47.928 97.309 47.784C97.165 47.616 97.093 47.424 97.093 47.208V47.1C97.093 46.98 97.129 46.884 97.201 46.812L105.157 34.644L98.065 23.988C97.993 23.892 97.957 23.76 97.957 23.592C97.957 23.376 98.029 23.196 98.173 23.052C98.341 22.884 98.533 22.8 98.749 22.8H106.525C107.149 22.8 107.653 23.1 108.037 23.7L110.845 28.308L113.869 23.628C114.037 23.412 114.217 23.22 114.409 23.052C114.625 22.884 114.937 22.8 115.345 22.8H123.085C123.301 22.8 123.481 22.884 123.625 23.052C123.793 23.196 123.877 23.376 123.877 23.592V23.7C123.877 23.82 123.841 23.916 123.769 23.988L116.245 35.112L123.949 46.812Z" />
                    <path class="accent-fill accent-stroke"
                        d="M111.857 13L111 19.8571L117 9.57143H110.143L111 1L105 13H111.857Z"
                        stroke-linejoin="round" />
                </svg>
                <v-min-profile @click="dropdownOpen()" :active="dropdownOpened"></v-min-profile>
                <transition name="show-close">
                    <v-min-profile-dropdown v-show="dropdownOpened"></v-min-profile-dropdown>
                </transition>
            </div>
        </div>
    </header>`
}
const MinProfile = {
    props: {
        active: Boolean
    },
    computed: {
        fullname() {
            return this.$store.getters.getUserData.name + ' ' + this.$store.getters.getUserData.surname + ' (id ' + this.$store.getters.getUserData.id + ')'
        }
    },
    template: `
  <div class="min-profile br10 hover">
      <div class="min-profile__fullname fw700">{{ fullname }}</div>
      <svg class="min-profile__dropdown-icon" :class="{'min-profile__dropdown-icon_active': active}" width="24" height="24" viewBox="0 0 24 24" fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <mask id="mask0_1_110" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0"
              width="24" height="24">
              <rect width="24" height="24" fill="#D9D9D9" />
          </mask>
          <g mask="url(#mask0_1_110)">
              <path
                  d="M11.375 14.025L9.14995 11.775C8.86662 11.4917 8.79995 11.1667 8.94995 10.8C9.09995 10.4333 9.38329 10.25 9.79996 10.25H14.225C14.625 10.25 14.904 10.4333 15.062 10.8C15.2206 11.1667 15.1583 11.4917 14.875 11.775L12.65 14.025C12.55 14.1083 12.45 14.175 12.35 14.225C12.25 14.275 12.1333 14.3 12 14.3C11.8833 14.3 11.775 14.275 11.675 14.225C11.575 14.175 11.475 14.1083 11.375 14.025Z"
                  fill="black"/>
          </g>
      </svg>
  </div>`
}
const MinProfileDropdown = {
    template: `
  <nav class="min-profile-dropdown br10">
    <div class="container">
        <div class="min-profile-dropdown__inner">
            <div class="min-profile-dropdown__main">
            </div>
            <div class="min-profile-dropdown-end">
                <a href="?logout"
                    class="nav__link min-profile-dropdown__link min-profile-dropdown__link_cancel hover br10">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <mask id="mask0_23_433" style="mask-type:alpha" maskUnits="userSpaceOnUse"
                            x="0" y="0" width="24" height="24">
                            <rect class="icon__accent f-cancel" width="24" height="24" />
                        </mask>
                        <g mask="url(#mask0_23_433)">
                            <path
                                d="M15.625 15.975C15.475 15.8083 15.4 15.625 15.4 15.425C15.4 15.225 15.475 15.05 15.625 14.9L17.525 13H9.87498C9.65831 13 9.47931 12.929 9.33798 12.787C9.19598 12.6457 9.12498 12.4667 9.12498 12.25C9.12498 12.0333 9.19598 11.854 9.33798 11.712C9.47931 11.5707 9.65831 11.5 9.87498 11.5H17.525L15.625 9.575C15.475 9.425 15.4 9.25 15.4 9.05C15.4 8.85 15.475 8.675 15.625 8.525C15.775 8.375 15.95 8.3 16.15 8.3C16.35 8.3 16.5166 8.36667 16.65 8.5L19.775 11.625C19.8583 11.7083 19.921 11.804 19.963 11.912C20.0043 12.0207 20.025 12.1333 20.025 12.25C20.025 12.3667 20.0043 12.479 19.963 12.587C19.921 12.6957 19.8583 12.7917 19.775 12.875L16.65 16C16.5 16.1667 16.3293 16.2417 16.138 16.225C15.946 16.2083 15.775 16.125 15.625 15.975ZM5.39998 21C4.89998 21 4.47498 20.825 4.12498 20.475C3.77498 20.125 3.59998 19.7 3.59998 19.2V5.3C3.59998 4.8 3.77498 4.375 4.12498 4.025C4.47498 3.675 4.89998 3.5 5.39998 3.5H11.375C11.575 3.5 11.75 3.57067 11.9 3.712C12.05 3.854 12.125 4.03333 12.125 4.25C12.125 4.46667 12.05 4.64567 11.9 4.787C11.75 4.929 11.575 5 11.375 5H5.39998C5.33331 5 5.26664 5.03333 5.19998 5.1C5.13331 5.16667 5.09998 5.23333 5.09998 5.3V19.2C5.09998 19.2667 5.13331 19.3333 5.19998 19.4C5.26664 19.4667 5.33331 19.5 5.39998 19.5H11.375C11.575 19.5 11.75 19.5707 11.9 19.712C12.05 19.854 12.125 20.0333 12.125 20.25C12.125 20.4667 12.05 20.646 11.9 20.788C11.75 20.9293 11.575 21 11.375 21H5.39998Z"
                                fill="#FF4848"/>
                        </g>
                    </svg>
                    <div class="link-text c-cancel">Выйти</div>
                </a>
            </div>
        </div>
    </div>
  </nav>`
}
const Sidebar = {
    computed: {
        getUserData() {
            return this.$store.getters.getUserData
        }
    },
    template: `
    <div class="sidebar">
        <nav class="sidebar__nav br10">
            <div class="container">
                <div class="sidebar__inner" v-if="getUserData.role == 'driver'">
                    <router-link to="/" class="nav__link br10">
                        <svg class="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <mask id="mask0_23_315" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                                <path d="M0 0H24V24H0V0Z" fill="#D9D9D9"/>
                            </mask>
                            <g mask="url(#mask0_23_315)">
                                <path class="icon__accent" d="M5 4V10.175V10.15V20V4ZM8 13.75H10.8C10.9167 13.4667 11.0583 13.2 11.225 12.95C11.3917 12.7 11.5833 12.4667 11.8 12.25H8C7.78333 12.25 7.60433 12.3207 7.463 12.462C7.321 12.604 7.25 12.7833 7.25 13C7.25 13.2167 7.321 13.3957 7.463 13.537C7.60433 13.679 7.78333 13.75 8 13.75ZM8 17.75H10.275C10.225 17.5 10.1917 17.25 10.175 17C10.1583 16.75 10.1583 16.5 10.175 16.25H8C7.78333 16.25 7.60433 16.3207 7.463 16.462C7.321 16.604 7.25 16.7833 7.25 17C7.25 17.2167 7.321 17.396 7.463 17.538C7.60433 17.6793 7.78333 17.75 8 17.75ZM5.3 21.5C4.8 21.5 4.375 21.325 4.025 20.975C3.675 20.625 3.5 20.2 3.5 19.7V4.3C3.5 3.8 3.675 3.375 4.025 3.025C4.375 2.675 4.8 2.5 5.3 2.5H12.5C12.75 2.5 12.9833 2.54567 13.2 2.637C13.4167 2.729 13.6083 2.85833 13.775 3.025L17.975 7.225C18.1417 7.39167 18.271 7.58333 18.363 7.8C18.4543 8.01667 18.5 8.25 18.5 8.5V10.5C18.2667 10.4167 18.025 10.35 17.775 10.3C17.525 10.25 17.2667 10.2083 17 10.175V8.5H13.4C13.15 8.5 12.9373 8.41233 12.762 8.237C12.5873 8.06233 12.5 7.85 12.5 7.6V4H5.3C5.23333 4 5.16667 4.03333 5.1 4.1C5.03333 4.16667 5 4.23333 5 4.3V19.7C5 19.7667 5.03333 19.8333 5.1 19.9C5.16667 19.9667 5.23333 20 5.3 20H11.2C11.4 20.3 11.621 20.575 11.863 20.825C12.1043 21.075 12.3667 21.3 12.65 21.5H5.3ZM16.5 19.15C17.25 19.15 17.8793 18.8957 18.388 18.387C18.896 17.879 19.15 17.25 19.15 16.5C19.15 15.75 18.896 15.121 18.388 14.613C17.8793 14.1043 17.25 13.85 16.5 13.85C15.75 13.85 15.121 14.1043 14.613 14.613C14.1043 15.121 13.85 15.75 13.85 16.5C13.85 17.25 14.1043 17.879 14.613 18.387C15.121 18.8957 15.75 19.15 16.5 19.15ZM22.125 22.125C21.9917 22.2583 21.8167 22.325 21.6 22.325C21.3833 22.325 21.2083 22.2583 21.075 22.125L18.85 19.9C18.5167 20.15 18.15 20.3373 17.75 20.462C17.35 20.5873 16.9333 20.65 16.5 20.65C15.35 20.65 14.3707 20.246 13.562 19.438C12.754 18.6293 12.35 17.65 12.35 16.5C12.35 15.35 12.754 14.3707 13.562 13.562C14.3707 12.754 15.35 12.35 16.5 12.35C17.65 12.35 18.6293 12.754 19.438 13.562C20.246 14.3707 20.65 15.35 20.65 16.5C20.65 16.9333 20.5877 17.35 20.463 17.75C20.3377 18.15 20.15 18.5167 19.9 18.85L22.125 21.075C22.2583 21.2083 22.325 21.3833 22.325 21.6C22.325 21.8167 22.2583 21.9917 22.125 22.125Z"/>
                            </g>
                        </svg>
                        <div class="link-text">Биржа</div>
                    </router-link>
                    <router-link to="/offers" class="nav__link br10">
                        <svg class="icon" width="24" height="24" viewBox="0 0 24 24" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <mask id="mask0_23_309" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0"
                                width="24" height="24">
                                <path d="M0 0H24V24H0V0Z" fill="#D9D9D9" />
                            </mask>
                            <g mask="url(#mask0_23_309)">
                                <path class="icon__accent"
                                    d="M8 16.625H13C13.2167 16.625 13.396 16.5543 13.538 16.413C13.6793 16.271 13.75 16.0917 13.75 15.875C13.75 15.675 13.6793 15.5 13.538 15.35C13.396 15.2 13.2167 15.125 13 15.125H8C7.78333 15.125 7.60433 15.2 7.463 15.35C7.321 15.5 7.25 15.675 7.25 15.875C7.25 16.0917 7.321 16.271 7.463 16.413C7.60433 16.5543 7.78333 16.625 8 16.625ZM8 12.75H16C16.2167 12.75 16.396 12.679 16.538 12.537C16.6793 12.3957 16.75 12.2167 16.75 12C16.75 11.7833 16.6793 11.604 16.538 11.462C16.396 11.3207 16.2167 11.25 16 11.25H8C7.78333 11.25 7.60433 11.3207 7.463 11.462C7.321 11.604 7.25 11.7833 7.25 12C7.25 12.2167 7.321 12.3957 7.463 12.537C7.60433 12.679 7.78333 12.75 8 12.75ZM8 8.875H16C16.2167 8.875 16.396 8.8 16.538 8.65C16.6793 8.5 16.75 8.325 16.75 8.125C16.75 7.90833 16.6793 7.72933 16.538 7.588C16.396 7.446 16.2167 7.375 16 7.375H8C7.78333 7.375 7.60433 7.446 7.463 7.588C7.321 7.72933 7.25 7.90833 7.25 8.125C7.25 8.325 7.321 8.5 7.463 8.65C7.60433 8.8 7.78333 8.875 8 8.875ZM5.3 19H18.7C18.7667 19 18.8333 18.9667 18.9 18.9C18.9667 18.8333 19 18.7667 19 18.7V5.3C19 5.23333 18.9667 5.16667 18.9 5.1C18.8333 5.03333 18.7667 5 18.7 5H5.3C5.23333 5 5.16667 5.03333 5.1 5.1C5.03333 5.16667 5 5.23333 5 5.3V18.7C5 18.7667 5.03333 18.8333 5.1 18.9C5.16667 18.9667 5.23333 19 5.3 19ZM5.3 20.5C4.8 20.5 4.375 20.325 4.025 19.975C3.675 19.625 3.5 19.2 3.5 18.7V5.3C3.5 4.8 3.675 4.375 4.025 4.025C4.375 3.675 4.8 3.5 5.3 3.5H9.75C9.81667 2.95 10.0627 2.479 10.488 2.087C10.9127 1.69567 11.4167 1.5 12 1.5C12.6 1.5 13.1083 1.69567 13.525 2.087C13.9417 2.479 14.1833 2.95 14.25 3.5H18.7C19.2 3.5 19.625 3.675 19.975 4.025C20.325 4.375 20.5 4.8 20.5 5.3V18.7C20.5 19.2 20.325 19.625 19.975 19.975C19.625 20.325 19.2 20.5 18.7 20.5H5.3ZM12 4.35C12.2167 4.35 12.396 4.279 12.538 4.137C12.6793 3.99567 12.75 3.81667 12.75 3.6C12.75 3.38333 12.6793 3.204 12.538 3.062C12.396 2.92067 12.2167 2.85 12 2.85C11.7833 2.85 11.6043 2.92067 11.463 3.062C11.321 3.204 11.25 3.38333 11.25 3.6C11.25 3.81667 11.321 3.99567 11.463 4.137C11.6043 4.279 11.7833 4.35 12 4.35Z" />
                            </g>
                        </svg>
                        <div class="link-text">Предложения</div>
                    </router-link>
                    <router-link to="/accepted" class="nav__link br10">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <mask id="mask0_143_426" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                                <rect width="24" height="24" fill="#D9D9D9"/>
                            </mask>
                            <g mask="url(#mask0_143_426)">
                                <path class="icon__accent" d="M10.5808 13.6154L8.25768 11.2923C8.11923 11.1539 7.9452 11.083 7.73558 11.0798C7.52596 11.0766 7.34872 11.1475 7.20386 11.2923C7.05899 11.4372 6.98656 11.6128 6.98656 11.8192C6.98656 12.0256 7.05899 12.2013 7.20386 12.3462L9.94808 15.0904C10.1288 15.2711 10.3397 15.3615 10.5808 15.3615C10.8218 15.3615 11.0327 15.2711 11.2135 15.0904L16.7769 9.52691C16.9154 9.38846 16.9862 9.21442 16.9894 9.00481C16.9926 8.79521 16.9218 8.61797 16.7769 8.47311C16.632 8.32822 16.4564 8.25578 16.25 8.25578C16.0436 8.25578 15.868 8.32822 15.7231 8.47311L10.5808 13.6154ZM5.30773 20.5C4.80901 20.5 4.38306 20.3234 4.02986 19.9702C3.67664 19.617 3.50003 19.191 3.50003 18.6923V5.30773C3.50003 4.80901 3.67664 4.38306 4.02986 4.02986C4.38306 3.67664 4.80901 3.50003 5.30773 3.50003H9.75773C9.82055 2.94491 10.0628 2.47281 10.4846 2.08371C10.9064 1.69459 11.4116 1.50003 12 1.50003C12.5949 1.50003 13.1032 1.69459 13.525 2.08371C13.9468 2.47281 14.1859 2.94491 14.2423 3.50003H18.6923C19.191 3.50003 19.617 3.67664 19.9702 4.02986C20.3234 4.38306 20.5 4.80901 20.5 5.30773V18.6923C20.5 19.191 20.3234 19.617 19.9702 19.9702C19.617 20.3234 19.191 20.5 18.6923 20.5H5.30773ZM5.30773 19H18.6923C18.7692 19 18.8397 18.968 18.9039 18.9039C18.968 18.8397 19 18.7692 19 18.6923V5.30773C19 5.2308 18.968 5.16027 18.9039 5.09616C18.8397 5.03206 18.7692 5.00001 18.6923 5.00001H5.30773C5.2308 5.00001 5.16027 5.03206 5.09616 5.09616C5.03206 5.16027 5.00001 5.2308 5.00001 5.30773V18.6923C5.00001 18.7692 5.03206 18.8397 5.09616 18.9039C5.16027 18.968 5.2308 19 5.30773 19ZM12 4.34616C12.2167 4.34616 12.3958 4.27532 12.5375 4.13366C12.6792 3.99199 12.75 3.81282 12.75 3.59616C12.75 3.37949 12.6792 3.20032 12.5375 3.05866C12.3958 2.91699 12.2167 2.84616 12 2.84616C11.7833 2.84616 11.6042 2.91699 11.4625 3.05866C11.3208 3.20032 11.25 3.37949 11.25 3.59616C11.25 3.81282 11.3208 3.99199 11.4625 4.13366C11.6042 4.27532 11.7833 4.34616 12 4.34616Z"/>
                            </g>
                        </svg>
                        <div class="link-text">Принятые</div>
                    </router-link>
                    <router-link to="/completed" class="nav__link br10">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <mask id="mask0_145_227" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                                <rect width="24" height="24" fill="#D9D9D9"/>
                            </mask>
                            <g mask="url(#mask0_145_227)">
                                <path class="icon__accent" d="M15.5 17.4616L20.6423 12.3192C20.7808 12.1808 20.9548 12.1099 21.1644 12.1067C21.374 12.1035 21.5513 12.1744 21.6962 12.3192C21.841 12.4641 21.9135 12.6397 21.9135 12.8461C21.9135 13.0525 21.841 13.2282 21.6962 13.373L16.1327 18.9365C15.9519 19.1173 15.741 19.2077 15.5 19.2077C15.259 19.2077 15.0481 19.1173 14.8673 18.9365L12.1231 16.1923C11.9846 16.0538 11.9138 15.8798 11.9106 15.6702C11.9074 15.4606 11.9782 15.2833 12.1231 15.1385C12.268 14.9936 12.4436 14.9212 12.65 14.9212C12.8564 14.9212 13.032 14.9936 13.1769 15.1385L15.5 17.4616ZM5.30773 20.5C4.81061 20.5 4.38506 20.323 4.03106 19.9689C3.67704 19.6149 3.50003 19.1894 3.50003 18.6923V5.30771C3.50003 4.8106 3.67704 4.38504 4.03106 4.03104C4.38506 3.67702 4.81061 3.50001 5.30773 3.50001H9.71351C9.85197 3.01285 10.135 2.60901 10.5625 2.28851C10.9901 1.968 11.4692 1.80774 12 1.80774C12.5513 1.80774 13.0381 1.968 13.4606 2.28851C13.883 2.60901 14.1634 3.01285 14.3019 3.50001H18.6923C19.1894 3.50001 19.615 3.67702 19.969 4.03104C20.323 4.38504 20.5 4.8106 20.5 5.30771V9.25001C20.5 9.4625 20.4281 9.64061 20.2843 9.78436C20.1404 9.92811 19.9622 9.99999 19.7497 9.99999C19.5371 9.99999 19.359 9.92811 19.2154 9.78436C19.0718 9.64061 19 9.4625 19 9.25001V5.30771C19 5.23078 18.968 5.16026 18.9039 5.09614C18.8397 5.03204 18.7692 4.99999 18.6923 4.99999H16.5V6.71151C16.5 6.9676 16.4137 7.18226 16.2412 7.35549C16.0687 7.52872 15.855 7.61534 15.6 7.61534H8.39986C8.14486 7.61534 7.93114 7.52872 7.75871 7.35549C7.58626 7.18226 7.50003 6.9676 7.50003 6.71151V4.99999H5.30773C5.2308 4.99999 5.16027 5.03204 5.09616 5.09614C5.03206 5.16026 5.00001 5.23078 5.00001 5.30771V18.6923C5.00001 18.7692 5.03206 18.8397 5.09616 18.9038C5.16027 18.9679 5.2308 19 5.30773 19H10.25C10.4625 19 10.6406 19.0719 10.7844 19.2157C10.9281 19.3595 11 19.5377 11 19.7503C11 19.9629 10.9281 20.141 10.7844 20.2846C10.6406 20.4282 10.4625 20.5 10.25 20.5H5.30773ZM12.0017 5.11539C12.2582 5.11539 12.4727 5.02861 12.6452 4.85504C12.8176 4.68149 12.9039 4.46643 12.9039 4.20986C12.9039 3.9533 12.8171 3.7388 12.6435 3.56636C12.4699 3.39393 12.2549 3.30771 11.9983 3.30771C11.7418 3.30771 11.5273 3.39449 11.3548 3.56804C11.1824 3.74161 11.0962 3.95667 11.0962 4.21324C11.0962 4.46981 11.1829 4.68431 11.3565 4.85674C11.5301 5.02917 11.7451 5.11539 12.0017 5.11539Z"/>
                            </g>
                        </svg>
                        <div class="link-text">Выполненные</div>
                    </router-link>
                </div>
                <div class="sidebar__inner" v-if="getUserData.role == 'client'">
                    <router-link to="/" class="nav__link br10">
                        <svg class="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <mask id="mask0_23_315" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                                <path d="M0 0H24V24H0V0Z" fill="#D9D9D9"/>
                            </mask>
                            <g mask="url(#mask0_23_315)">
                                <path class="icon__accent" d="M5 4V10.175V10.15V20V4ZM8 13.75H10.8C10.9167 13.4667 11.0583 13.2 11.225 12.95C11.3917 12.7 11.5833 12.4667 11.8 12.25H8C7.78333 12.25 7.60433 12.3207 7.463 12.462C7.321 12.604 7.25 12.7833 7.25 13C7.25 13.2167 7.321 13.3957 7.463 13.537C7.60433 13.679 7.78333 13.75 8 13.75ZM8 17.75H10.275C10.225 17.5 10.1917 17.25 10.175 17C10.1583 16.75 10.1583 16.5 10.175 16.25H8C7.78333 16.25 7.60433 16.3207 7.463 16.462C7.321 16.604 7.25 16.7833 7.25 17C7.25 17.2167 7.321 17.396 7.463 17.538C7.60433 17.6793 7.78333 17.75 8 17.75ZM5.3 21.5C4.8 21.5 4.375 21.325 4.025 20.975C3.675 20.625 3.5 20.2 3.5 19.7V4.3C3.5 3.8 3.675 3.375 4.025 3.025C4.375 2.675 4.8 2.5 5.3 2.5H12.5C12.75 2.5 12.9833 2.54567 13.2 2.637C13.4167 2.729 13.6083 2.85833 13.775 3.025L17.975 7.225C18.1417 7.39167 18.271 7.58333 18.363 7.8C18.4543 8.01667 18.5 8.25 18.5 8.5V10.5C18.2667 10.4167 18.025 10.35 17.775 10.3C17.525 10.25 17.2667 10.2083 17 10.175V8.5H13.4C13.15 8.5 12.9373 8.41233 12.762 8.237C12.5873 8.06233 12.5 7.85 12.5 7.6V4H5.3C5.23333 4 5.16667 4.03333 5.1 4.1C5.03333 4.16667 5 4.23333 5 4.3V19.7C5 19.7667 5.03333 19.8333 5.1 19.9C5.16667 19.9667 5.23333 20 5.3 20H11.2C11.4 20.3 11.621 20.575 11.863 20.825C12.1043 21.075 12.3667 21.3 12.65 21.5H5.3ZM16.5 19.15C17.25 19.15 17.8793 18.8957 18.388 18.387C18.896 17.879 19.15 17.25 19.15 16.5C19.15 15.75 18.896 15.121 18.388 14.613C17.8793 14.1043 17.25 13.85 16.5 13.85C15.75 13.85 15.121 14.1043 14.613 14.613C14.1043 15.121 13.85 15.75 13.85 16.5C13.85 17.25 14.1043 17.879 14.613 18.387C15.121 18.8957 15.75 19.15 16.5 19.15ZM22.125 22.125C21.9917 22.2583 21.8167 22.325 21.6 22.325C21.3833 22.325 21.2083 22.2583 21.075 22.125L18.85 19.9C18.5167 20.15 18.15 20.3373 17.75 20.462C17.35 20.5873 16.9333 20.65 16.5 20.65C15.35 20.65 14.3707 20.246 13.562 19.438C12.754 18.6293 12.35 17.65 12.35 16.5C12.35 15.35 12.754 14.3707 13.562 13.562C14.3707 12.754 15.35 12.35 16.5 12.35C17.65 12.35 18.6293 12.754 19.438 13.562C20.246 14.3707 20.65 15.35 20.65 16.5C20.65 16.9333 20.5877 17.35 20.463 17.75C20.3377 18.15 20.15 18.5167 19.9 18.85L22.125 21.075C22.2583 21.2083 22.325 21.3833 22.325 21.6C22.325 21.8167 22.2583 21.9917 22.125 22.125Z"/>
                            </g>
                        </svg>
                        <div class="link-text">Биржа</div>
                    </router-link>
                    <router-link to="/create" class="nav__link br10">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <mask id="mask0_155_411" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                    <rect width="24" height="24" fill="#D9D9D9"/>
                    </mask>
                    <g mask="url(#mask0_155_411)">
                    <path class="icon__accent" d="M6.30773 21.5C5.8026 21.5 5.37503 21.325 5.02503 20.975C4.67503 20.625 4.50003 20.1974 4.50003 19.6922V4.3077C4.50003 3.80257 4.67503 3.375 5.02503 3.025C5.37503 2.675 5.8026 2.5 6.30773 2.5H13.502C13.743 2.5 13.9747 2.5468 14.1971 2.6404C14.4196 2.73398 14.6128 2.86282 14.777 3.02692L18.9731 7.22303C19.1372 7.38714 19.266 7.58042 19.3596 7.80285C19.4532 8.02528 19.5 8.25701 19.5 8.49803V11.548H18V8.49995H14.4039C14.1462 8.49995 13.9311 8.41373 13.7587 8.24128C13.5863 8.06884 13.5 7.85378 13.5 7.5961V3.99997H6.30773C6.2308 3.99997 6.16027 4.03203 6.09616 4.09613C6.03206 4.16024 6.00001 4.23077 6.00001 4.3077V19.6922C6.00001 19.7692 6.03206 19.8397 6.09616 19.9038C6.16027 19.9679 6.2308 20 6.30773 20H11.6346V21.5H6.30773ZM17.8384 14.5442L18.6923 15.3884L14.8269 19.2384V20.2884H15.8769L19.7423 16.4384L20.5807 17.2769L16.6576 21.2096C16.564 21.3032 16.4628 21.3717 16.3538 21.4153C16.2448 21.4589 16.1301 21.4807 16.0096 21.4807H14.0865C13.966 21.4807 13.8606 21.4371 13.7702 21.35C13.6798 21.2628 13.6346 21.1557 13.6346 21.0288V19.125C13.6346 19.0045 13.6564 18.8897 13.7 18.7808C13.7436 18.6718 13.8122 18.5705 13.9058 18.4769L17.8384 14.5442ZM20.5807 17.2769L17.8384 14.5442L19.1442 13.2385C19.3147 13.0744 19.5272 12.9923 19.7817 12.9923C20.0362 12.9923 20.2455 13.0744 20.4096 13.2385L21.8865 14.7154C22.0506 14.8795 22.1326 15.0887 22.1326 15.3432C22.1326 15.5977 22.0506 15.8102 21.8865 15.9807L20.5807 17.2769Z"/>
                    </g>
                    </svg>
                    
                        <div class="link-text">Создать заявку</div>
                    </router-link>
                    <router-link to="/in-search" class="nav__link br10">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <mask id="mask0_215_1516" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                            <rect width="24" height="24" fill="#D9D9D9"/>
                        </mask>
                        <g mask="url(#mask0_215_1516)">
                            <path class="icon__accent" d="M11.2577 16.4615C11.5705 16.4615 11.8743 16.4176 12.1692 16.3298C12.4641 16.2419 12.7397 16.1166 12.9962 15.9538L15.0539 18.0115C15.1923 18.15 15.3664 18.2208 15.576 18.224C15.7856 18.2272 15.9628 18.1564 16.1077 18.0115C16.2525 17.8666 16.325 17.691 16.325 17.4846C16.325 17.2782 16.2525 17.1025 16.1077 16.9577L14.05 14.9C14.2256 14.65 14.3541 14.3759 14.4356 14.0779C14.517 13.7798 14.5577 13.4743 14.5577 13.1615C14.5577 12.2654 14.2416 11.508 13.6096 10.8894C12.9776 10.2708 12.2102 9.9615 11.3077 9.9615C10.4051 9.9615 9.63783 10.2775 9.00578 10.9096C8.37373 11.5416 8.05771 12.3089 8.05771 13.2115C8.05771 14.1141 8.367 14.8814 8.98558 15.5134C9.60416 16.1455 10.3615 16.4615 11.2577 16.4615ZM11.3077 14.9615C10.8269 14.9615 10.4151 14.79 10.0721 14.4471C9.72914 14.1041 9.55766 13.6923 9.55766 13.2115C9.55766 12.7307 9.72914 12.3189 10.0721 11.9759C10.4151 11.633 10.8269 11.4615 11.3077 11.4615C11.7885 11.4615 12.2003 11.633 12.5433 11.9759C12.8862 12.3189 13.0577 12.7307 13.0577 13.2115C13.0577 13.6923 12.8862 14.1041 12.5433 14.4471C12.2003 14.79 11.7885 14.9615 11.3077 14.9615ZM6.30773 21.5C5.8026 21.5 5.37503 21.325 5.02503 20.975C4.67503 20.625 4.50003 20.1974 4.50003 19.6922V4.3077C4.50003 3.80257 4.67503 3.375 5.02503 3.025C5.37503 2.675 5.8026 2.5 6.30773 2.5H13.502C13.743 2.5 13.9747 2.5468 14.1971 2.6404C14.4196 2.73398 14.6128 2.86282 14.777 3.02692L18.9731 7.22303C19.1372 7.38714 19.266 7.58042 19.3596 7.80285C19.4532 8.02528 19.5 8.25701 19.5 8.49803V19.6922C19.5 20.1974 19.325 20.625 18.975 20.975C18.625 21.325 18.1974 21.5 17.6923 21.5H6.30773ZM13.5 7.5961V3.99997H6.30773C6.2308 3.99997 6.16027 4.03203 6.09616 4.09613C6.03206 4.16024 6.00001 4.23077 6.00001 4.3077V19.6922C6.00001 19.7692 6.03206 19.8397 6.09616 19.9038C6.16027 19.9679 6.2308 20 6.30773 20H17.6923C17.7692 20 17.8397 19.9679 17.9039 19.9038C17.968 19.8397 18 19.7692 18 19.6922V8.49995H14.4039C14.1462 8.49995 13.9311 8.41373 13.7587 8.24128C13.5863 8.06884 13.5 7.85378 13.5 7.5961Z"/>
                        </g>
                    </svg>
                    
                    
                        <div class="link-text">Заявки в поиске</div>
                    </router-link>
                    <router-link to="/accepted" class="nav__link br10">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <mask id="mask0_143_426" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                                <rect width="24" height="24" fill="#D9D9D9"/>
                            </mask>
                            <g mask="url(#mask0_143_426)">
                                <path class="icon__accent" d="M10.5808 13.6154L8.25768 11.2923C8.11923 11.1539 7.9452 11.083 7.73558 11.0798C7.52596 11.0766 7.34872 11.1475 7.20386 11.2923C7.05899 11.4372 6.98656 11.6128 6.98656 11.8192C6.98656 12.0256 7.05899 12.2013 7.20386 12.3462L9.94808 15.0904C10.1288 15.2711 10.3397 15.3615 10.5808 15.3615C10.8218 15.3615 11.0327 15.2711 11.2135 15.0904L16.7769 9.52691C16.9154 9.38846 16.9862 9.21442 16.9894 9.00481C16.9926 8.79521 16.9218 8.61797 16.7769 8.47311C16.632 8.32822 16.4564 8.25578 16.25 8.25578C16.0436 8.25578 15.868 8.32822 15.7231 8.47311L10.5808 13.6154ZM5.30773 20.5C4.80901 20.5 4.38306 20.3234 4.02986 19.9702C3.67664 19.617 3.50003 19.191 3.50003 18.6923V5.30773C3.50003 4.80901 3.67664 4.38306 4.02986 4.02986C4.38306 3.67664 4.80901 3.50003 5.30773 3.50003H9.75773C9.82055 2.94491 10.0628 2.47281 10.4846 2.08371C10.9064 1.69459 11.4116 1.50003 12 1.50003C12.5949 1.50003 13.1032 1.69459 13.525 2.08371C13.9468 2.47281 14.1859 2.94491 14.2423 3.50003H18.6923C19.191 3.50003 19.617 3.67664 19.9702 4.02986C20.3234 4.38306 20.5 4.80901 20.5 5.30773V18.6923C20.5 19.191 20.3234 19.617 19.9702 19.9702C19.617 20.3234 19.191 20.5 18.6923 20.5H5.30773ZM5.30773 19H18.6923C18.7692 19 18.8397 18.968 18.9039 18.9039C18.968 18.8397 19 18.7692 19 18.6923V5.30773C19 5.2308 18.968 5.16027 18.9039 5.09616C18.8397 5.03206 18.7692 5.00001 18.6923 5.00001H5.30773C5.2308 5.00001 5.16027 5.03206 5.09616 5.09616C5.03206 5.16027 5.00001 5.2308 5.00001 5.30773V18.6923C5.00001 18.7692 5.03206 18.8397 5.09616 18.9039C5.16027 18.968 5.2308 19 5.30773 19ZM12 4.34616C12.2167 4.34616 12.3958 4.27532 12.5375 4.13366C12.6792 3.99199 12.75 3.81282 12.75 3.59616C12.75 3.37949 12.6792 3.20032 12.5375 3.05866C12.3958 2.91699 12.2167 2.84616 12 2.84616C11.7833 2.84616 11.6042 2.91699 11.4625 3.05866C11.3208 3.20032 11.25 3.37949 11.25 3.59616C11.25 3.81282 11.3208 3.99199 11.4625 4.13366C11.6042 4.27532 11.7833 4.34616 12 4.34616Z"/>
                            </g>
                        </svg>
                        <div class="link-text">Принятые заявки</div>
                    </router-link>
                    <router-link to="/archive" class="nav__link br10">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <mask id="mask0_145_227" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                                <rect width="24" height="24" fill="#D9D9D9"/>
                            </mask>
                            <g mask="url(#mask0_145_227)">
                                <path class="icon__accent" d="M15.5 17.4616L20.6423 12.3192C20.7808 12.1808 20.9548 12.1099 21.1644 12.1067C21.374 12.1035 21.5513 12.1744 21.6962 12.3192C21.841 12.4641 21.9135 12.6397 21.9135 12.8461C21.9135 13.0525 21.841 13.2282 21.6962 13.373L16.1327 18.9365C15.9519 19.1173 15.741 19.2077 15.5 19.2077C15.259 19.2077 15.0481 19.1173 14.8673 18.9365L12.1231 16.1923C11.9846 16.0538 11.9138 15.8798 11.9106 15.6702C11.9074 15.4606 11.9782 15.2833 12.1231 15.1385C12.268 14.9936 12.4436 14.9212 12.65 14.9212C12.8564 14.9212 13.032 14.9936 13.1769 15.1385L15.5 17.4616ZM5.30773 20.5C4.81061 20.5 4.38506 20.323 4.03106 19.9689C3.67704 19.6149 3.50003 19.1894 3.50003 18.6923V5.30771C3.50003 4.8106 3.67704 4.38504 4.03106 4.03104C4.38506 3.67702 4.81061 3.50001 5.30773 3.50001H9.71351C9.85197 3.01285 10.135 2.60901 10.5625 2.28851C10.9901 1.968 11.4692 1.80774 12 1.80774C12.5513 1.80774 13.0381 1.968 13.4606 2.28851C13.883 2.60901 14.1634 3.01285 14.3019 3.50001H18.6923C19.1894 3.50001 19.615 3.67702 19.969 4.03104C20.323 4.38504 20.5 4.8106 20.5 5.30771V9.25001C20.5 9.4625 20.4281 9.64061 20.2843 9.78436C20.1404 9.92811 19.9622 9.99999 19.7497 9.99999C19.5371 9.99999 19.359 9.92811 19.2154 9.78436C19.0718 9.64061 19 9.4625 19 9.25001V5.30771C19 5.23078 18.968 5.16026 18.9039 5.09614C18.8397 5.03204 18.7692 4.99999 18.6923 4.99999H16.5V6.71151C16.5 6.9676 16.4137 7.18226 16.2412 7.35549C16.0687 7.52872 15.855 7.61534 15.6 7.61534H8.39986C8.14486 7.61534 7.93114 7.52872 7.75871 7.35549C7.58626 7.18226 7.50003 6.9676 7.50003 6.71151V4.99999H5.30773C5.2308 4.99999 5.16027 5.03204 5.09616 5.09614C5.03206 5.16026 5.00001 5.23078 5.00001 5.30771V18.6923C5.00001 18.7692 5.03206 18.8397 5.09616 18.9038C5.16027 18.9679 5.2308 19 5.30773 19H10.25C10.4625 19 10.6406 19.0719 10.7844 19.2157C10.9281 19.3595 11 19.5377 11 19.7503C11 19.9629 10.9281 20.141 10.7844 20.2846C10.6406 20.4282 10.4625 20.5 10.25 20.5H5.30773ZM12.0017 5.11539C12.2582 5.11539 12.4727 5.02861 12.6452 4.85504C12.8176 4.68149 12.9039 4.46643 12.9039 4.20986C12.9039 3.9533 12.8171 3.7388 12.6435 3.56636C12.4699 3.39393 12.2549 3.30771 11.9983 3.30771C11.7418 3.30771 11.5273 3.39449 11.3548 3.56804C11.1824 3.74161 11.0962 3.95667 11.0962 4.21324C11.0962 4.46981 11.1829 4.68431 11.3565 4.85674C11.5301 5.02917 11.7451 5.11539 12.0017 5.11539Z"/>
                            </g>
                        </svg>
                        <div class="link-text">Архив</div>
                    </router-link>
                </div>
            </div>
        </nav>
    </div>`
}
const Notifs = {
    computed: {
        getNotifs() {
            return this.$store.getters.getNotifs
        }
    },
    template: `
    <transition-group tag="div" name="show-close-notifs" class="notifs">
        <v-notif v-for="notif in getNotifs" :key="notif.id" :notif="notif"></v-notif>
    </transition-group>`
}
const Notif = {
    props: ['key', 'notif'],
    mounted() {
        this.deleteNotif(false)
    },
    methods: {
        deleteNotif(now) {
            if (now) {
                this.$store.commit('deleteNotif', this.notif.id)
            }
            else {
                setTimeout(() => {
                    if (this.$store.getters.getNotif(this.notif.id)) {
                        this.$store.commit('deleteNotif', this.notif.id)
                    }
                }, 5000)
            }

        }
    },
    template: `
        <div class="notif br10">
            <div class="notif__close-wrapper">
                <svg @click="deleteNotif(true)" class="notif__close hover" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <mask id="mask0_182_758" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="20" height="20">
                        <rect width="20" height="20" fill="#D9D9D9" />
                    </mask>
                    <g mask="url(#mask0_182_758)">
                        <path class="icon__accent" d="M10 10.9407L5.83492 15.1058C5.70565 15.235 5.55368 15.2975 5.379 15.2933C5.20433 15.289 5.04969 15.2196 4.91508 15.0849C4.78046 14.9503 4.71314 14.7935 4.71314 14.6146C4.71314 14.4356 4.78046 14.2789 4.91508 14.1443L9.05931 10L4.89425 5.83493C4.76497 5.70566 4.70247 5.55022 4.70675 5.36859C4.71101 5.18698 4.78046 5.02887 4.91508 4.89426C5.04969 4.75963 5.20647 4.69232 5.38542 4.69232C5.56436 4.69232 5.72114 4.75963 5.85575 4.89426L10 9.05932L14.1651 4.89426C14.2943 4.76498 14.4498 4.69901 14.6314 4.69634C14.813 4.69366 14.9711 4.75963 15.1057 4.89426C15.2404 5.02887 15.3077 5.18565 15.3077 5.36459C15.3077 5.54354 15.2404 5.70031 15.1057 5.83493L10.9407 10L15.1057 14.1651C15.235 14.2944 15.301 14.4463 15.3037 14.621C15.3063 14.7957 15.2404 14.9503 15.1057 15.0849C14.9711 15.2196 14.8144 15.2869 14.6354 15.2869C14.4565 15.2869 14.2997 15.2196 14.1651 15.0849L10 10.9407Z"/>
                    </g>
                </svg>
            </div>
            <div class="notif__text">{{ notif.text }}</div>
        </div>
    `
}
const Offers = {
    computed: {
        getPersonalOrders() {
            return this.$store.getters.getPersonalOrders
        }
    },
    template: `
    <div class="main-component__wrapper">
        <main class="offers main-component br10">
            <div class="container">
                <h1 class="title">Предложения</h1>
                <div class="orders offers__inner">
                    <v-order
                      v-for="order in getPersonalOrders"
                      :key="order.id"
                      :order="order"
                      orderPlace="offers">
                    </v-order>
                    <div v-if="!getPersonalOrders.length">Заявок нет :(</div>
                </div>
            </div>
        </main>
    </div>`
}
const Order = {
    props: ['order', 'orderPlace'],
    computed: {
        toUserWeight() {
            return this.order.weight + ' ' + this.order.weightUnit + '.'
        },
        toUserPrice() {
            return this.order.price.replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₽";
        },
        fullStreetFrom() {
            return this.order.streetFrom + ' ' + this.order.houseFrom
        },
        fullStreetTo() {
            return this.order.streetTo + ' ' + this.order.houseTo
        },
        getPathToViewOrder() {
            return '/orders/' + this.order.id
        },
        formateDateFrom() {
            const date = new Date(this.order.dateFrom);
            const day = date.getDate();
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            const formattedDate = `${day < 10 ? '0' : ''}${day}.${month < 10 ? '0' : ''}${month}.${year}`;
            return formattedDate;
        },
        formateDateTo() {
            const date = new Date(this.order.dateTo);
            const day = date.getDate();
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            const formattedDate = `${day < 10 ? '0' : ''}${day}.${month < 10 ? '0' : ''}${month}.${year}`;
            return formattedDate;
        },
        orderParams() {
            const response = {
                btnViewShow: null,
                btnCancelShow: null,
                importantInfo: null,
                importantInfo2: null
            }
            switch (this.orderPlace) {
                case 'offers': {
                    response.importantInfo = this.order.client
                    break
                }
                case 'market': {
                    response.importantInfo = this.order.client
                    break
                }
                case 'accepted': {
                    response.importantInfo = this.order.client
                    break
                }
                case 'completed': {
                    response.importantInfo = this.order.client
                    break
                }
                case 'in-search': {
                    switch (this.order.view) {
                        case 'public': {
                            response.importantInfo = 'На бирже'
                            break
                        }
                        case 'private': {
                            response.importantInfo = 'Предложение для id ' + this.order.offerToUserId
                            response.importantInfo2 = this.order.contractor.name + ' ' + this.order.contractor.surname
                            break
                        }
                    }
                    break
                }
                case 'accepted-client': {
                    response.importantInfo = 'Принят id ' + this.order.acceptedUserId
                    response.importantInfo2 = this.order.contractor.name + ' ' + this.order.contractor.surname
                    break
                }
                case 'archive': {
                    response.importantInfo = 'Выполнен id ' + this.order.acceptedUserId
                    response.importantInfo2 = this.order.contractor.name + ' ' + this.order.contractor.surname
                    break
                }
            }
            return response
        }
    },
    template: `
    <div class="offer br10">
        <div class="offer__id">{{ order.id }}</div>
        <div class="destination">
            <div class="from">
                <span class="destination__town destination__town_from">{{ order.townFrom }}</span>
                <span class="destination__street destination__street_from">{{ fullStreetFrom }}</span>
                <span class="destination__date destination__date_from">{{ formateDateFrom }}</span>
            </div>
            <svg class="icon" width="24" height="24" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <mask id="mask0_1_244" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0"
                    width="24" height="24">
                    <rect width="24" height="24" fill="#D9D9D9" />
                </mask>
                <g mask="url(#mask0_1_244)">
                    <path class="icon__accent"
                        d="M13.525 17.1C13.375 16.95 13.3 16.7707 13.3 16.562C13.3 16.354 13.375 16.175 13.525 16.025L16.825 12.75H5.05005C4.83338 12.75 4.65438 12.679 4.51305 12.537C4.37105 12.3957 4.30005 12.2167 4.30005 12C4.30005 11.7833 4.37105 11.604 4.51305 11.462C4.65438 11.3207 4.83338 11.25 5.05005 11.25H16.825L13.5 7.94999C13.3667 7.79999 13.3 7.62499 13.3 7.42499C13.3 7.22499 13.375 7.04999 13.525 6.89999C13.675 6.73333 13.85 6.64999 14.05 6.64999C14.25 6.64999 14.4334 6.73333 14.6 6.89999L19.075 11.375C19.1584 11.4583 19.221 11.554 19.263 11.662C19.3044 11.7707 19.325 11.8833 19.325 12C19.325 12.1167 19.3044 12.229 19.263 12.337C19.221 12.4457 19.1584 12.5417 19.075 12.625L14.575 17.125C14.425 17.275 14.25 17.35 14.05 17.35C13.85 17.35 13.675 17.2667 13.525 17.1Z" />
                </g>
            </svg>
            <div class="to">
                <span class="destination__town destination__town_to">{{ order.townTo }}</span>
                <span class="destination__street destination__street_to">{{ fullStreetTo }}</span>
                <span class="destination__date destination__date_to">{{ formateDateTo }}</span>
            </div>
        </div>
        <div class="info">
            <div v-if="orderParams.importantInfo" class="info__item info__important">{{ orderParams.importantInfo }}</div>
            <div v-if="orderParams.importantInfo2" class="info__item info__important">{{ orderParams.importantInfo2 }}</div>
        </div>
        <div class="offer__price">{{ toUserPrice }}</div>
        <router-link :to="getPathToViewOrder" class="offer__button offer__accept">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <mask id="mask0_167_724" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                    <rect width="24" height="24" fill="#D9D9D9"/>
                </mask>
                <g mask="url(#mask0_167_724)">
                    <path class="icon__accent" d="M16.6538 19.5C16.7718 19.5 16.875 19.4557 16.9634 19.3673C17.0519 19.2788 17.0961 19.1756 17.0961 19.0577V16.4423C17.0961 16.3244 17.0519 16.2212 16.9634 16.1327C16.875 16.0442 16.7718 16 16.6538 16C16.5359 16 16.4326 16.0442 16.3442 16.1327C16.2557 16.2212 16.2115 16.3244 16.2115 16.4423V19.0577C16.2115 19.1756 16.2557 19.2788 16.3442 19.3673C16.4326 19.4557 16.5359 19.5 16.6538 19.5ZM16.6538 15.0866C16.7743 15.093 16.8782 15.051 16.9653 14.9606C17.0525 14.8702 17.0961 14.7648 17.0961 14.6443C17.0961 14.5237 17.0516 14.4199 16.9626 14.3327C16.8736 14.2455 16.7697 14.202 16.651 14.202C16.5324 14.202 16.4294 14.2458 16.3422 14.3334C16.2551 14.421 16.2115 14.5233 16.2115 14.6401C16.2115 14.757 16.2557 14.8606 16.3442 14.951C16.4326 15.0414 16.5359 15.0866 16.6538 15.0866ZM4.99997 4.00001V10.1827V10.1539V20V4.00001ZM7.99997 13.75H10.7327C10.8775 13.4628 11.0404 13.1958 11.2211 12.9491C11.4019 12.7023 11.6006 12.4692 11.8173 12.25H7.99997C7.78747 12.25 7.60936 12.3219 7.46563 12.4657C7.32188 12.6095 7.25 12.7877 7.25 13.0003C7.25 13.2129 7.32188 13.391 7.46563 13.5346C7.60936 13.6782 7.78747 13.75 7.99997 13.75ZM7.99997 17.75H10.0269C9.98972 17.5 9.96952 17.25 9.96632 17C9.96311 16.75 9.97688 16.5 10.0076 16.25H7.99997C7.78747 16.25 7.60936 16.3219 7.46563 16.4657C7.32188 16.6096 7.25 16.7877 7.25 17.0003C7.25 17.2129 7.32188 17.391 7.46563 17.5346C7.60936 17.6782 7.78747 17.75 7.99997 17.75ZM5.30915 
                    21.5C4.80305 21.5 4.375 21.325 4.025 20.975C3.675 20.625 3.5 20.1974 3.5 19.6923V4.30773C3.5 3.8026 3.675 3.37503 4.025 3.02503C4.375 2.67503 4.80257 2.50003 5.3077 2.50003H12.5019C12.7458 2.50003 12.9782 2.54683 13.1993 2.64043C13.4203 2.73401 13.6128 2.86286 13.7769 3.02696L17.973 7.22306C18.1371 7.38717 18.266 7.57973 18.3595 7.80073C18.4531 8.02175 18.5 8.25419 18.5 8.49806V10.4154C18.2602 10.341 18.0169 10.2853 17.7702 10.2481C17.5234 10.2109 17.2666 10.1891 17 10.1827V8.49998H13.3998C13.1448 8.49998 12.9311 8.41373 12.7587 8.24123C12.5862 8.06873 12.5 7.85498 12.5 7.59998V4.00001H5.3077C5.23077 4.00001 5.16024 4.03206 5.09612 4.09616C5.03202 4.16027 4.99997 4.2308 4.99997 4.30773V19.6923C4.99997 19.7692 5.03202 19.8397 5.09612 19.9039C5.16024 19.968 5.23077 20 5.3077 20H10.7615C10.9064 20.2872 11.0708 20.5542 11.2548 20.801C11.4387 21.0477 11.6423 21.2807 11.8653 21.5H5.30915ZM16.6538 12.3462C17.9025 12.3462 18.9647 12.784 19.8403 13.6596C20.7159 14.5353 21.1538 15.5974 21.1538 16.8462C21.1538 18.0949 20.7159 19.157 19.8403 20.0327C18.9647 20.9083 17.9025 21.3461 16.6538 21.3461C15.4051 21.3461 14.3429 20.9083 13.4673 20.0327C12.5916 19.157 12.1538 18.0949 12.1538 16.8462C12.1538 15.5974 12.5916 14.5353 13.4673 13.6596C14.3429 12.784 15.4051 12.3462 16.6538 12.3462Z"/>
                </g>
            </svg>
        </router-link>
    </div>`
}
const Market = {
    data() {
        return {
            openedFilters: false,
            openedSort: false,
            searchValue: '',
            filtersData: null,
        }
    },
    computed: {
        getGeneralOrders() {
            return this.$store.getters.getGeneralOrders
        },
        allOrdersRecieved() {
            return this.$store.getters.getGeneralOrdersAllRecieved
        }
    },
    methods: {
        convertToGeneralFormateDate(stock_date) {
            if (stock_date) {
                const parts = stock_date.split('.')
                return `${parts[2]}-${parts[1]}-${parts[0]}`
            }
            else return null
        },
        checkSimilarity(order) {
            let response = true
            RegExpsimilarity = new RegExp(this.searchValue, 'i')
            if (RegExpsimilarity.test(order.client)) {
                if (this.filtersData) {
                    // Превращение ['', 0, false] в null для стандартизации пустых значений
                    this.filtersData.townFrom = this.filtersData.townFrom == '' ? null : this.filtersData.townFrom
                    this.filtersData.townTo = this.filtersData.townTo == '' ? null : this.filtersData.townTo
                    this.filtersData.priceFrom = this.filtersData.priceFrom == '' ? null : this.filtersData.priceFrom
                    this.filtersData.priceTo = this.filtersData.priceTo == '' ? null : this.filtersData.priceTo
                    this.filtersData.dateFrom = this.filtersData.dateFrom == '' ? null : this.convertToGeneralFormateDate(this.filtersData.dateFrom)
                    this.filtersData.dateTo = this.filtersData.dateTo == '' ? null : this.convertToGeneralFormateDate(this.filtersData.dateTo)

                    this.filtersData.weight = this.filtersData.weight == 0 ? null : this.filtersData.weight
                    this.filtersData.volume = this.filtersData.volume == 0 ? null : this.filtersData.volume
                    this.filtersData.height = this.filtersData.height == 0 ? null : this.filtersData.height

                    this.filtersData.perish = this.filtersData.perish == false ? null : this.filtersData.perish
                    this.filtersData.fragil = this.filtersData.fragil == false ? null : this.filtersData.fragil

                    // Проверка заявки на соответствие фильтрам
                    if (this.filtersData.townFrom && this.filtersData.townFrom != order.townFrom) response = false
                    if (this.filtersData.townTo && this.filtersData.townTo != order.townTo) response = false
                    if (this.filtersData.priceFrom && order.price < this.filtersData.priceFrom) response = false
                    if (this.filtersData.priceTo && order.price > this.filtersData.priceTo) response = false
                    if (this.filtersData.dateFrom && new Date(order.dateFrom).getTime() != new Date(this.filtersData.dateFrom).getTime()) response = false
                    if (this.filtersData.dateTo && new Date(order.dateTo).getTime() != new Date(this.filtersData.dateTo).getTime()) response = false
                    if (this.filtersData.weight && (this.filtersData.weight != order.weight || this.filtersData.weightUnit != order.weightUnit)) response = false
                    if (this.filtersData.volume && order.volume != this.filtersData.volume) response = false
                    if (this.filtersData.height && order.height != this.filtersData.height) response = false
                    if (this.filtersData.perish && order.perish != this.filtersData.perish) response = false
                    if (this.filtersData.fragil && order.fragil != this.filtersData.fragil) response = false
                }
            }
            else response = false
            return response
        },
        dispatchFetchGeneralOrders(more) {
            this.$store.dispatch('fetchOrders', more)
        },
    },
    template: `
    <div class="main-component__wrapper">
        <main class="market main-component br10">
            <div class="container">
                <h1 class="title">Биржа</h1>
                <div class="market__inner">
                    <div class="market-panel">
                        <div class="market-actions">
                            <div class="market-action">
                                <button class="btn btn_hover market-actions__btn" @click="openedFilters = true">Фильтры</button>
                                <transition name="show-close">
                                    <v-filters v-show="openedFilters"
                                        @open="(opened) => openedFilters = opened"
                                        @getFiltersData="(data) => filtersData = data">
                                    </v-filters>
                                </transition>
                            </div>
                            <div class="market-action">
                                <button class="btn btn_hover market-actions__btn" @click="openedSort = true">Сортировать
                                    по:</button>
                                <transition name="show-close">
                                    <v-sort v-show="openedSort" 
                                    @open="(opened) => openedSort = opened">
                                    </v-sort>
                                </transition>
                            </div>
                        </div>
                        <v-search @searchValueChanged="data => searchValue = data"></v-search>
                    </div>
                    <div class="orders market__orders">
                        <v-order 
                        v-for="order in getGeneralOrders" 
                        :key="order.id" 
                        v-show="checkSimilarity(order)" 
                        :order="order" 
                        orderPlace="market">
                        </v-order>
                        <div v-if="!getGeneralOrders.length">Заявок нет :(</div>
                    </div>
                    <button v-if="!allOrdersRecieved" class="btn btn_hover btn__more" @click="dispatchFetchGeneralOrders(true)">Ещё</button>
                </div>
            </div>
        </main>
    </div>`
}
const Filters = {
    data() {
        return {
            filtersData: {
                townFrom: null,
                townTo: null,
                priceFrom: null,
                priceTo: null,
                dateFrom: null,
                dateTo: null,
                weight: null,
                weightUnit: 'т',
                volume: null,
                height: null,
                perish: null,
                fragil: null
            },
            dropdownTownFromShow: false,
            dropdownTownToShow: false,
            dropdownItemsTown: [],
            dropdownItemsTownFromFiltered: [],
            dropdownItemsTownToFiltered: [],
        }
    },
    computed: {
        // Получение российских городов из API
        async getdropdownItems() {
            response = await fetch('../api/russian-cities.json');
            if (response.ok) {
                json = await response.json();
                this.dropdownItemsTown = json
            }
        }
    },
    methods: {
        selectItem(value, where) {
            switch (where) {
                case 'from': {
                    this.filtersData.townFrom = value
                    break
                }
                case 'to': {
                    this.filtersData.townTo = value
                    break
                }
            }
        },
        dropdownItemsFilter(input) {
            if (input == '') input = ' '
            regExpdropdownItems = new RegExp('^' + input, 'i')
            dropdownItemsFiltered = this.dropdownItemsTown.filter(item => regExpdropdownItems.test(item.name))
            return dropdownItemsFiltered
        },
        getData() {
            // Превращение ['', 0, false] в null для стандартизации пустых значений
            let filtersData = {}
            filtersData.townFrom = this.filtersData.townFrom == '' ? null : this.filtersData.townFrom
            filtersData.townTo = this.filtersData.townTo == '' ? null : this.filtersData.townTo
            filtersData.priceFrom = this.filtersData.priceFrom == 0 ? null : Number(this.filtersData.priceFrom)
            filtersData.priceTo = this.filtersData.priceTo == 0 ? null : Number(this.filtersData.priceTo)
            filtersData.dateFrom = this.filtersData.dateFrom == '' ? null : this.filtersData.dateFrom
            filtersData.dateTo = this.filtersData.dateTo == '' ? null : this.filtersData.dateTo

            filtersData.weight = this.filtersData.weight == 0 ? null : this.filtersData.weight
            filtersData.volume = this.filtersData.volume == 0 ? null : this.filtersData.volume
            filtersData.height = this.filtersData.height == 0 ? null : this.filtersData.height

            filtersData.perish = this.filtersData.perish == false ? null : this.filtersData.perish
            filtersData.fragil = this.filtersData.fragil == false ? null : this.filtersData.fragil
            return filtersData
        },
        clearData() {
            for (const prop of Object.getOwnPropertyNames(this.filtersData)) {
                this.filtersData[prop] = null
                if (prop == 'weightUnit') this.filtersData[prop] = 'т'
            }
        }
    },
    watch: {
        'filtersData.townFrom'() {
            this.dropdownItemsTownFromFiltered = this.dropdownItemsFilter(this.filtersData.townFrom)
            this.dropdownTownFromShow = (this.dropdownItemsTownFromFiltered.length && !this.dropdownItemsTownFromFiltered.find(item => item.name == this.filtersData.townFrom)) ? true : false
            this.$store.commit('setFilterGeneralOrders', this.getData())
        },
        'filtersData.townTo'() {
            this.dropdownItemsTownToFiltered = this.dropdownItemsFilter(this.filtersData.townTo)
            this.dropdownTownToShow = (this.dropdownItemsTownToFiltered.length && !this.dropdownItemsTownToFiltered.find(item => item.name == this.filtersData.townTo)) ? true : false
            this.$store.commit('setFilterGeneralOrders', this.getData())
        },
        'filtersData.priceFrom'() {
            this.$store.commit('setFilterGeneralOrders', this.getData())
        },
        'filtersData.priceTo'() {
            this.$store.commit('setFilterGeneralOrders', this.getData())
        },
        'filtersData.dateFrom'() {
            this.$store.commit('setFilterGeneralOrders', this.getData())
        },
        'filtersData.dateTo'() {
            this.$store.commit('setFilterGeneralOrders', this.getData())
        },
        'filtersData.weight'() {
            this.$store.commit('setFilterGeneralOrders', this.getData())
        },
        'filtersData.weightUnit'() {
            this.$store.commit('setFilterGeneralOrders', this.getData())
        },
        'filtersData.volume'() {
            this.$store.commit('setFilterGeneralOrders', this.getData())
        },
        'filtersData.height'() {
            this.$store.commit('setFilterGeneralOrders', this.getData())
        },
        'filtersData.perish'() {
            this.$store.commit('setFilterGeneralOrders', this.getData())
        },
        'filtersData.fragil'() {
            this.$store.commit('setFilterGeneralOrders', this.getData())
        },
    },
    mounted() {
        this.getdropdownItems
    },
    template: `
    <div class="display-helper br10">
        <div class="container">
            <div class="display-helper__inner">
                <div class="display-helper__fields">
                    <div class="display-helper__col">
                    <div class="display-helper__from-to">
                        <div class="display-helper__input-wrapper">
                            <span class="display-helper__input-name">Город отправления</span>
                            <input type="text" class="input display-helper__input"
                                placeholder="Москва" v-model="filtersData.townFrom">
                            <div v-show="dropdownTownFromShow" class="dropdown-select br10">
                                <div v-for="item in dropdownItemsTownFromFiltered" class="dropdown-select__option" @click="selectItem(item.name, 'from')" @keyup.enter="selectItem(item.name, 'from')" tabindex="0">{{ item.name }}</div>
                            </div>
                        </div>
                        <svg class="icon" width="24" height="24" viewBox="0 0 24 24"
                            fill="none" xmlns="http://www.w3.org/2000/svg">
                            <mask id="mask0_1_244" style="mask-type:alpha"
                                maskUnits="userSpaceOnUse" x="0" y="0" width="24"
                                height="24">
                                <rect width="24" height="24" fill="#D9D9D9" />
                            </mask>
                            <g mask="url(#mask0_1_244)">
                                <path class="icon__accent"
                                    d="M13.525 17.1C13.375 16.95 13.3 16.7707 13.3 16.562C13.3 16.354 13.375 16.175 13.525 16.025L16.825 12.75H5.05005C4.83338 12.75 4.65438 12.679 4.51305 12.537C4.37105 12.3957 4.30005 12.2167 4.30005 12C4.30005 11.7833 4.37105 11.604 4.51305 11.462C4.65438 11.3207 4.83338 11.25 5.05005 11.25H16.825L13.5 7.94999C13.3667 7.79999 13.3 7.62499 13.3 7.42499C13.3 7.22499 13.375 7.04999 13.525 6.89999C13.675 6.73333 13.85 6.64999 14.05 6.64999C14.25 6.64999 14.4334 6.73333 14.6 6.89999L19.075 11.375C19.1584 11.4583 19.221 11.554 19.263 11.662C19.3044 11.7707 19.325 11.8833 19.325 12C19.325 12.1167 19.3044 12.229 19.263 12.337C19.221 12.4457 19.1584 12.5417 19.075 12.625L14.575 17.125C14.425 17.275 14.25 17.35 14.05 17.35C13.85 17.35 13.675 17.2667 13.525 17.1Z" />
                            </g>
                        </svg>
                        <div class="display-helper__input-wrapper">
                        <span class="display-helper__input-name">Город прибытия</span>
                            <input type="text" class="input display-helper__input"
                                placeholder="Санкт-Петербург" v-model="filtersData.townTo">
                            <div v-show="dropdownTownToShow" class="dropdown-select br10">
                                <div v-for="item in dropdownItemsTownToFiltered" class="dropdown-select__option" @click="selectItem(item.name, 'to')" @keyup.enter="selectItem(item.name, 'to')" tabindex="0">{{ item.name }}</div>
                            </div>
                        </div>
                    </div>
                    <div class="display-helper__from-to">
                        <div class="display-helper__input-wrapper">
                            <span class="display-helper__input-name">Цена от</span>
                            <input type="number" class="input display-helper__input"
                                placeholder="10000" v-model="filtersData.priceFrom">
                        </div>
                        <svg class="icon" width="24" height="24" viewBox="0 0 24 24"
                            fill="none" xmlns="http://www.w3.org/2000/svg">
                            <mask id="mask0_1_244" style="mask-type:alpha"
                                maskUnits="userSpaceOnUse" x="0" y="0" width="24"
                                height="24">
                                <rect width="24" height="24" fill="#D9D9D9" />
                            </mask>
                            <g mask="url(#mask0_1_244)">
                                <path class="icon__accent"
                                    d="M13.525 17.1C13.375 16.95 13.3 16.7707 13.3 16.562C13.3 16.354 13.375 16.175 13.525 16.025L16.825 12.75H5.05005C4.83338 12.75 4.65438 12.679 4.51305 12.537C4.37105 12.3957 4.30005 12.2167 4.30005 12C4.30005 11.7833 4.37105 11.604 4.51305 11.462C4.65438 11.3207 4.83338 11.25 5.05005 11.25H16.825L13.5 7.94999C13.3667 7.79999 13.3 7.62499 13.3 7.42499C13.3 7.22499 13.375 7.04999 13.525 6.89999C13.675 6.73333 13.85 6.64999 14.05 6.64999C14.25 6.64999 14.4334 6.73333 14.6 6.89999L19.075 11.375C19.1584 11.4583 19.221 11.554 19.263 11.662C19.3044 11.7707 19.325 11.8833 19.325 12C19.325 12.1167 19.3044 12.229 19.263 12.337C19.221 12.4457 19.1584 12.5417 19.075 12.625L14.575 17.125C14.425 17.275 14.25 17.35 14.05 17.35C13.85 17.35 13.675 17.2667 13.525 17.1Z" />
                            </g>
                        </svg>
                        <div class="display-helper__input-wrapper">
                        <span class="display-helper__input-name">Цена до</span>
                            <input type="number" class="input display-helper__input"
                                placeholder="100000" v-model="filtersData.priceTo">
                        </div>
                    </div>
                    <div class="display-helper__from-to">
                        <div class="display-helper__input-wrapper">
                            <span class="display-helper__input-name">Дата отправления</span>
                            <input type="date" class="input display-helper__input"
                                placeholder="01.01.2023" v-model="filtersData.dateFrom">
                        </div>
                        <svg class="icon" width="24" height="24" viewBox="0 0 24 24"
                            fill="none" xmlns="http://www.w3.org/2000/svg">
                            <mask id="mask0_1_244" style="mask-type:alpha"
                                maskUnits="userSpaceOnUse" x="0" y="0" width="24"
                                height="24">
                                <rect width="24" height="24" fill="#D9D9D9" />
                            </mask>
                            <g mask="url(#mask0_1_244)">
                                <path class="icon__accent"
                                    d="M13.525 17.1C13.375 16.95 13.3 16.7707 13.3 16.562C13.3 16.354 13.375 16.175 13.525 16.025L16.825 12.75H5.05005C4.83338 12.75 4.65438 12.679 4.51305 12.537C4.37105 12.3957 4.30005 12.2167 4.30005 12C4.30005 11.7833 4.37105 11.604 4.51305 11.462C4.65438 11.3207 4.83338 11.25 5.05005 11.25H16.825L13.5 7.94999C13.3667 7.79999 13.3 7.62499 13.3 7.42499C13.3 7.22499 13.375 7.04999 13.525 6.89999C13.675 6.73333 13.85 6.64999 14.05 6.64999C14.25 6.64999 14.4334 6.73333 14.6 6.89999L19.075 11.375C19.1584 11.4583 19.221 11.554 19.263 11.662C19.3044 11.7707 19.325 11.8833 19.325 12C19.325 12.1167 19.3044 12.229 19.263 12.337C19.221 12.4457 19.1584 12.5417 19.075 12.625L14.575 17.125C14.425 17.275 14.25 17.35 14.05 17.35C13.85 17.35 13.675 17.2667 13.525 17.1Z" />
                            </g>
                        </svg>
                        <div class="display-helper__input-wrapper">
                            <span class="display-helper__input-name">Дата прибытия</span>
                            <input type="date" class="input display-helper__input"
                                placeholder="05.01.2023" v-model="filtersData.dateTo">
                        </div>
                    </div>
                        <div class="checkboxes">
                            <div class="checkbox">
                                <input type="checkbox" id="perish" ref="perish" v-model="filtersData.perish">
                                <label for="perish" class="checkbox__name">Скоропортящаяся продукция</label>
                            </div>
                            <div class="checkbox">
                                <input type="checkbox" id="fragil" ref="fragil" v-model="filtersData.fragil">
                                <label for="fragil" class="checkbox__name">Хрупкая продукция</label>
                            </div>
                        </div>
                    </div>
                    <div class="display-helper__col">
                        <div class="display-helper__weight">
                            <span class="display-helper__input-name">Вес</span>
                            <div class="display-helper__inputs">
                                <input type="number" class="input display-helper__input" placeholder="1" v-model="filtersData.weight">
                                <select class="input" v-model="filtersData.weightUnit">
                                    <option value="т">т</option>
                                    <option value="кг">кг</option>
                                </select>
                            </div>
                        </div>
                        <div class="display-helper__volume">
                            <span class="display-helper__input-name">Объем в литрах</span>
                            <input type="number" class="input display-helper__input" placeholder="200" v-model="filtersData.volume">
                        </div>
                        <div class="display-helper__height">
                            <span class="display-helper__input-name">Длина в метрах</span>
                            <input type="number" class="input display-helper__input" placeholder="4" v-model="filtersData.height">
                        </div>
                    </div>
                </div>
                <div class="display-helper-actions">
                    <button class="btn btn_hover display-helper__btn" @click="clearData()">Очистить</button>
                    <button class="btn btn_hover display-helper__btn" @click="$emit('open', false)">Закрыть</button>
                </div>
            </div>
        </div>
    </div>`
}
const Sort = {
    data() {
        return {
            sortData: {
                sortItem: null,
                sortDirection: null
            }

        }
    },
    methods: {
        clearData() {
            for (const prop of Object.getOwnPropertyNames(this.sortData)) {
                this.sortData[prop] = null
            }
        }
    },
    watch: {
        'sortData.sortItem'() {
            this.$store.commit('setSortGeneralOrders', this.sortData)
        },
        'sortData.sortDirection'() {
            this.$store.commit('setSortGeneralOrders', this.sortData)
        }
    },
    template: `
    <div class="display-helper sort br10">
        <div class="container">
            <div class="display-helper__inner">
                <div class="display-helper__fields">
                    <div class="display-helper__col checkboxes">
                        <div class="checkbox">
                            <input type="radio" name="sort-item" id="date-to" value="date-from" v-model="sortData.sortItem">
                            <label for="date-to" class="checkbox__name">дате отправления</label>
                        </div>
                        <div class="checkbox">
                            <input type="radio" name="sort-item" id="date-from" value="date-to" v-model="sortData.sortItem">
                            <label for="date-from" class="checkbox__name">дате прибытия</label>
                        </div>
                        <div class="checkbox">
                            <input type="radio" name="sort-item" id="price" value="price" v-model="sortData.sortItem">
                            <label for="price" class="checkbox__name">цене</label>
                        </div>
                    </div>
                    <div class="display-helper__col checkboxes">
                        <div class="checkbox">
                            <input type="radio" name="sort-direction" id="to" value="from" v-model="sortData.sortDirection">
                            <label for="to" class="checkbox__name">возрастанию</label>
                        </div>
                        <div class="checkbox">
                            <input type="radio" name="sort-direction" id="from" value="to" v-model="sortData.sortDirection">
                            <label for="from" class="checkbox__name">убыванию</label>
                        </div>
                    </div>
                </div>
                <div class="display-helper-actions">
                    <button class="btn btn_hover display-helper__btn" @click="clearData()">Очистить</button>
                    <button class="btn btn_hover display-helper__btn" @click="$emit('open', false)">Закрыть</button>
                </div>
            </div>
        </div>
    </div>`
}
const Search = {
    data() {
        return {
            searchValue: ''
        }
    },
    template: `
    <div class="market-search">
        <input type="text" class="input market-search__search" @keyup.enter="$emit('searchValueChanged', searchValue)" v-model="searchValue" placeholder="Поиск">
        <button type="submit" class="market-search__submit" @click="$emit('searchValueChanged', searchValue)" title="Поиск">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <mask id="mask0_5_323" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0"
                    y="0" width="24" height="24">
                    <rect width="24" height="24" fill="#D9D9D9" />
                </mask>
                <g mask="url(#mask0_5_323)">
                    <path class="icon__gray-lv3"
                        d="M19.0249 20.05L13.2499 14.3C12.7499 14.7167 12.1749 15.0417 11.5249 15.275C10.8749 15.5083 10.2082 15.625 9.5249 15.625C7.80824 15.625 6.35824 15.0333 5.1749 13.85C3.99157 12.6667 3.3999 11.2167 3.3999 9.5C3.3999 7.8 3.99157 6.354 5.1749 5.162C6.35824 3.97067 7.80824 3.375 9.5249 3.375C11.2249 3.375 12.6666 3.96667 13.8499 5.15C15.0332 6.33333 15.6249 7.78333 15.6249 9.5C15.6249 10.2167 15.5082 10.9 15.2749 11.55C15.0416 12.2 14.7249 12.7667 14.3249 13.25L20.0999 19.025C20.2332 19.1583 20.2999 19.325 20.2999 19.525C20.2999 19.725 20.2249 19.9 20.0749 20.05C19.9249 20.2 19.7459 20.275 19.5379 20.275C19.3292 20.275 19.1582 20.2 19.0249 20.05ZM9.5249 14.125C10.8082 14.125 11.8959 13.675 12.7879 12.775C13.6792 11.875 14.1249 10.7833 14.1249 9.5C14.1249 8.21667 13.6792 7.125 12.7879 6.225C11.8959 5.325 10.8082 4.875 9.5249 4.875C8.2249 4.875 7.12924 5.325 6.2379 6.225C5.3459 7.125 4.8999 8.21667 4.8999 9.5C4.8999 10.7833 5.3459 11.875 6.2379 12.775C7.12924 13.675 8.2249 14.125 9.5249 14.125Z" />
                </g>
            </svg>
        </button>
    </div>`
}
const Accepted = {
    computed: {
        getAcceptedOrders() {
            return this.$store.getters.getAcceptedOrders
        }
    },
    template: `
    <div class="main-component__wrapper">
        <main class="accepted main-component br10">
            <div class="container">
                <h1 class="title fw700">Принятые</h1>
                <div class="orders accepted__inner">
                    <v-order
                    v-for="order in getAcceptedOrders"
                    :key="order.id"
                    :order="order"
                    orderPlace="accepted">
                    </v-order>
                    <div v-if="!getAcceptedOrders.length">Заявок нет :(</div>
                </div>
            </div>
        </main>
    </div>`
}
const Completed = {
    computed: {
        getCompletedOrders() {
            return this.$store.getters.getCompletedOrders
        }
    },
    template: `
    <div class="main-component__wrapper">
        <main class="completed main-component br10">
            <div class="container">
                <h1 class="title fw700">Выполненные</h1>
                <div class="orders completed__inner">
                    <v-order
                    v-for="order in getCompletedOrders"
                    :key="order.id"
                    :order="order"
                    orderPlace="completed">
                    </v-order>
                    <div v-if="!getCompletedOrders.length">Заявок нет :(</div>
                </div>
            </div>
        </main>
    </div>`
}
const ViewOrder = {
    data() {
        return {
            markedCompleted: false
        }
    },
    computed: {
        getOrder() {
            return this.$store.getters.getOrder(this.$route.params.id)
        },
        getUserData() {
            return this.$store.getters.getUserData
        },
        formatedPrice() {
            return this.getOrder.price.replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₽";
        }
    },
    methods: {
        formateDate(stock_date) {
            const date = new Date(stock_date)
            const day = date.getDate()
            const month = date.getMonth() + 1
            const year = date.getFullYear()
            const formattedDate = `${day < 10 ? '0' : ''}${day}.${month < 10 ? '0' : ''}${month}.${year}`
            return formattedDate
        },
        formateTime(stock_date) {
            const date = new Date(stock_date)
            const hours = date.getHours()
            const minutes = date.getMinutes()
            return `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}`
        },
        formateStatus(stock_status) {
            switch (stock_status) {
                case 'search': {
                    return 'В поиске'
                }
                case 'accepted': {
                    return 'Принят'
                }
                case 'completed': {
                    return 'Выполнен'
                }
            }
        },
        cancelAcceptedOrder() {
            fetch('../api/cancel-accepted-order.php', {
                method: 'post',
                body: JSON.stringify({ orderId: this.getOrder.id }),
                headers: {
                    "Content-Type": "application/json; charset=utf-8"
                }
            })
                .then(response => response.json())
                .then(data => {
                    if (data.status) {
                        this.$store.commit('switchOrderStatus', {
                            id: this.getOrder.id,
                            status: 'search',
                        })
                        if (this.getOrder.view == 'public') {
                            this.$store.commit('setFor', {
                                id: this.getOrder.id,
                                for: 'market',
                            })
                        }
                    }
                    this.$store.dispatch('createNotif', data.message)
                })
        },
        acceptOrder() {
            fetch('../api/accept-order.php', {
                method: 'post',
                body: JSON.stringify({
                    orderId: this.getOrder.id
                }),
                headers: {
                    "Content-Type": "application/json; charset=utf-8"
                }
            })
                .then(response => response.json())
                .then(data => {
                    if (data.status) {
                        store.commit('switchOrderStatus', {
                            id: this.getOrder.id,
                            status: 'accepted',
                        })
                        store.commit('setAcceptDate', {
                            id: this.getOrder.id,
                            acceptDate: new Date(new Date(data.acceptDate).getTime() - 1000 * 60 * 60 * 3 - new Date().getTimezoneOffset() * 60 * 1000)
                        })
                    }
                    this.$store.dispatch('createNotif', data.message)
                })
        },
        cancelOffer() {
            fetch('../api/cancel-offer.php', {
                method: 'post',
                body: JSON.stringify({
                    orderId: this.getOrder.id
                }),
                headers: {
                    "Content-Type": "application/json; charset=utf-8"
                }
            })
                .then(response => response.json())
                .then(data => {
                    if (data.status) store.commit('switchOrderStatus', {
                        id: this.getOrder.id,
                        status: 'canceled',
                    })
                    this.$store.dispatch('createNotif', data.message)
                })
        },
        deleteOrder() {
            fetch('../api/delete-order.php', {
                method: 'post',
                body: JSON.stringify({
                    orderId: this.getOrder.id
                }),
                headers: {
                    "Content-Type": "application/json; charset=utf-8"
                }
            })
                .then(response => response.json())
                .then(data => {
                    if (data.status) store.commit('deleteOrder', this.getOrder.id)
                    this.$store.dispatch('createNotif', data.message)
                    this.$router.push('/in-search')
                })
        },
        markCompleted() {
            fetch('../api/mark-completed.php', {
                method: 'post',
                body: JSON.stringify({
                    orderId: this.getOrder.id
                }),
                headers: {
                    "Content-Type": "application/json; charset=utf-8"
                }
            })
                .then(response => response.json())
                .then(data => {
                    if (data.status) {
                        store.commit('switchOrderStatus', {
                            id: this.getOrder.id,
                            status: 'completed',
                        })
                        store.commit('setCompleteDate', {
                            id: this.getOrder.id,
                            completeDate: new Date(new Date(data.completeDate).getTime() - 1000 * 60 * 60 * 3 - new Date().getTimezoneOffset() * 60 * 1000)
                        })
                    }
                    this.$store.dispatch('createNotif', data.message)
                })
        }
    },
    template: `
    <div class="main-component__wrapper">
        <main v-if="getOrder" class="order main-component br10">
            <div class="container">
                <h1 class="title order__title fw700">
                    <span>Заявка {{ getOrder.id }} от {{ getOrder.client }}</span>
                    <span class="order__date">{{ formateDate(getOrder.createDate) }}</span>
                </h1>
                <div class="order__inner">
                    <ul class="order__properties">
                        <li class="order-property">
                            <span class="order-property__name fw500">Точка отправления: </span>
                            {{ getOrder.townFrom }}, {{ getOrder.streetFrom }}{{ ' ' + getOrder.houseFrom }}, 
                            <span class="fw500">{{ formateDate(getOrder.dateFrom) }}</span> 
                            в 
                            <span class="fw500">{{ formateTime(getOrder.dateFrom) }}</span>
                        </li>
                        <li class="order-property">
                            <span class="order-property__name fw500">Точка прибытия: </span>
                            {{ getOrder.townTo }}, {{ getOrder.streetTo }}{{ ' ' + getOrder.houseTo }},
                            <span class="fw500">{{ formateDate(getOrder.dateTo) }}</span> 
                            в 
                            <span class="fw500">{{ formateTime(getOrder.dateTo) }}</span>
                        </li>
                        <li v-if="getOrder.weight" class="order-property">
                            <span class="order-property__name fw500">Вес: </span>
                            {{ getOrder.weight }} {{ getOrder.weightUnit }}.
                        </li>
                        <li v-if="getOrder.volume" class="order-property">
                            <span class="order-property__name fw500">Объем: </span>
                            {{ getOrder.volume }} л.
                        </li>
                        <li v-if="getOrder.height" class="order-property">
                            <span class="order-property__name fw500">Высота: </span>
                            {{ getOrder.height }} м.
                        </li>
                        <li v-if="getOrder.perish == '1'" class="order-property">
                            <span class="order-property__name fw500">Скоропортящаяся продукция: </span>
                            да
                        </li>
                        <li v-if="getOrder.fragil == '1'" class="order-property">
                            <span class="order-property__name fw500">Хрупкая продукция: </span>
                            да
                        </li>
                        <li v-if="getOrder.clientInfo.phone" class="order-property">
                            <span class="order-property__name fw500">Телефон: </span>
                            {{ getOrder.clientInfo.phone }}
                        </li>
                        <li v-if="getOrder.clientInfo.email" class="order-property">
                            <span class="order-property__name fw500">Email: </span>
                            {{ getOrder.clientInfo.email }}
                        </li>
                        <li v-if="getOrder.status" class="order-property">
                            <span class="order-property__name fw500">Статус: </span>
                            {{ formateStatus(getOrder.status) }}
                        </li>
                        <li v-if="getOrder.status == 'accepted' || getOrder.status == 'completed'" class="order-property">
                            <span class="order-property__name fw500">Исполнитель: </span>
                            {{ getOrder.contractor.name + ' ' + getOrder.contractor.surname + ' (id ' + getOrder.acceptedUserId + ')' }}
                        </li>
                        <li v-if="getOrder.description" class="order-property">
                            <span class="order-property__name fw500">Комментарий: </span>
                            {{ getOrder.description }}
                        </li>
                    </ul>
                    <div class="order__price fw700">{{ formatedPrice }}</div>
                    <div class="order__actions">
                        <button v-if="getUserData.role == 'driver' && getOrder.status == 'search'" class="btn btn_hover order__btn" @click="acceptOrder()">Принять</button>
                        <button v-if="getUserData.role == 'driver' && getOrder.status == 'accepted' && (new Date().getTime() / 1000 - new Date(getOrder.acceptDate).getTime() / 1000) <= 600" class="btn btn_hover order__btn" @click="cancelAcceptedOrder()">Отменить</button>
                        <button v-if="getOrder.view == 'private' && getOrder.status == 'search' && getUserData.role == 'driver'" class="btn btn_hover order__btn" @click="cancelOffer()">Отклонить</button>
                        <button v-if="getOrder.status == 'search' && getOrder.clientId == getUserData.id" class="btn btn_hover order__btn" @click="deleteOrder()">Удалить</button>
                        <button v-if="getOrder.status == 'accepted' && getOrder.clientId == getUserData.id" @click="markCompleted()" :class="{'btn': true, 'btn_hover': markedCompleted ? false : true, 'order__btn': true}" :disabled="markedCompleted ? true : false">{{ markedCompleted ? 'Отмечено ✓' : 'Отметить выполненным' }}</button>
                        <button @click="$router.go(-1)" class="btn btn_hover order__btn">Назад</button>
                    </div>
                </div>
            </div>
        </main>
    </div>`
}
const InSearch = {
    computed: {
        getOrdersInSearch() {
            return this.$store.getters.getOrdersInSearch
        }
    },
    template: `
    <div class="main-component__wrapper">
        <main class="completed main-component br10">
            <div class="container">
                <h1 class="title fw700">Заявки в поиске</h1>
                <div class="orders completed__inner">
                    <v-order
                    v-for="order in getOrdersInSearch"
                    :key="order.id"
                    :order="order"
                    orderPlace="in-search">
                    </v-order>
                    <div v-if="!getOrdersInSearch.length">Заявок нет :(</div>
                </div>
            </div>
        </main>
    </div>`
}
const Create = {
    data() {
        return {
            orderInfo: {
                townFrom: null,
                streetFrom: null,
                houseFrom: null,
                dateFrom: null,
                townTo: null,
                streetTo: null,
                houseTo: null,
                dateTo: null,
                weight: null,
                weightUnit: 'т',
                volume: null,
                height: null,
                price: null,
                view: 'public',
                offerToUserId: null,
                perish: null,
                fragil: null,
                description: null,
            },
            errors: {},
            orderCreated: false
        }
    },
    computed: {
        getUserData() {
            return this.$store.getters.getUserData
        }
    },
    methods: {
        createOrder() {
            fetch('../api/create-order.php', {
                method: 'post',
                body: JSON.stringify(this.orderInfo),
                headers: {
                    "Content-Type": "application/json; charset=utf-8"
                }
            })
                .then(response => response.json())
                .then(data => {
                    if (data.status) {
                        this.orderCreated = true
                        setTimeout(() => {
                            this.orderCreated = false
                        }, 3000)
                    }
                    else this.errors = data.errors
                    this.$store.dispatch('createNotif', data.message)
                })
        },
        clearData() {
            for (const prop of Object.getOwnPropertyNames(this.orderInfo)) {
                this.orderInfo[prop] = null
                if (prop == 'weightUnit') this.orderInfo[prop] = 'т'
                if (prop == 'view') this.orderInfo[prop] = 'public'
            }
        }
    },
    watch: {
        houseFrom() {
            this.houseFrom = this.houseFrom < 1 ? null : this.houseFrom
        },
        houseTo() {
            this.houseTo = this.houseTo < 1 ? null : this.houseTo
        },
        weight() {
            this.weight = this.weight < 1 ? null : this.weight
        },
        volume() {
            this.volume = this.volume < 1 ? null : this.volume
        },
        height() {
            this.height = this.height < 1 ? null : this.height
        },
    },
    template: `
    <div class="main-component__wrapper">
        <main class="create main-component br10">
            <div class="container">
                <h1 class="title fw700">Создать заявку</h1>
                <div class="create__inner">
                    <div class="display-helper__fields">
                        <div class="display-helper__col create-form__col">
                            <div class="display-helper__from-to">
                                <div class="display-helper__input-wrapper">
                                    <span class="display-helper__input-name">Город отправления <span class="c-cancel">*</span></span>
                                    <input type="text" class="input display-helper__input" placeholder="Москва" v-model="orderInfo.townFrom">
                                    <span class="display-helper__input-error">{{ errors.townFrom }}</span>
                                </div>
                                <svg class="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <mask id="mask0_1_244" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                                        <rect width="24" height="24" fill="#D9D9D9" />
                                    </mask>
                                    <g mask="url(#mask0_1_244)">
                                        <path class="icon__accent" d="M13.525 17.1C13.375 16.95 13.3 16.7707 13.3 16.562C13.3 16.354 13.375 16.175 13.525 16.025L16.825 12.75H5.05005C4.83338 12.75 4.65438 12.679 4.51305 12.537C4.37105 12.3957 4.30005 12.2167 4.30005 12C4.30005 11.7833 4.37105 11.604 4.51305 11.462C4.65438 11.3207 4.83338 11.25 5.05005 11.25H16.825L13.5 7.94999C13.3667 7.79999 13.3 7.62499 13.3 7.42499C13.3 7.22499 13.375 7.04999 13.525 6.89999C13.675 6.73333 13.85 6.64999 14.05 6.64999C14.25 6.64999 14.4334 6.73333 14.6 6.89999L19.075 11.375C19.1584 11.4583 19.221 11.554 19.263 11.662C19.3044 11.7707 19.325 11.8833 19.325 12C19.325 12.1167 19.3044 12.229 19.263 12.337C19.221 12.4457 19.1584 12.5417 19.075 12.625L14.575 17.125C14.425 17.275 14.25 17.35 14.05 17.35C13.85 17.35 13.675 17.2667 13.525 17.1Z" />
                                    </g>
                                </svg>
                                <div class="display-helper__input-wrapper">
                                    <span class="display-helper__input-name">Город прибытия <span class="c-cancel">*</span></span>
                                    <input type="text" class="input display-helper__input" placeholder="Санкт-Петербург" v-model="orderInfo.townTo">
                                    <span class="display-helper__input-error">{{ errors.townTo }}</span>
                                </div>
                            </div>
                            <div class="display-helper__from-to">
                                <div class="display-helper__input-wrapper">
                                    <span class="display-helper__input-name">Улица отправления <span class="c-cancel">*</span></span>
                                    <input type="text" class="input display-helper__input" placeholder="ул. Ленина" v-model="orderInfo.streetFrom">
                                    <span class="display-helper__input-error">{{ errors.streetFrom }}</span>
                                </div>
                                <svg class="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <mask id="mask0_1_244" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                                        <rect width="24" height="24" fill="#D9D9D9" />
                                    </mask>
                                    <g mask="url(#mask0_1_244)">
                                        <path class="icon__accent" d="M13.525 17.1C13.375 16.95 13.3 16.7707 13.3 16.562C13.3 16.354 13.375 16.175 13.525 16.025L16.825 12.75H5.05005C4.83338 12.75 4.65438 12.679 4.51305 12.537C4.37105 12.3957 4.30005 12.2167 4.30005 12C4.30005 11.7833 4.37105 11.604 4.51305 11.462C4.65438 11.3207 4.83338 11.25 5.05005 11.25H16.825L13.5 7.94999C13.3667 7.79999 13.3 7.62499 13.3 7.42499C13.3 7.22499 13.375 7.04999 13.525 6.89999C13.675 6.73333 13.85 6.64999 14.05 6.64999C14.25 6.64999 14.4334 6.73333 14.6 6.89999L19.075 11.375C19.1584 11.4583 19.221 11.554 19.263 11.662C19.3044 11.7707 19.325 11.8833 19.325 12C19.325 12.1167 19.3044 12.229 19.263 12.337C19.221 12.4457 19.1584 12.5417 19.075 12.625L14.575 17.125C14.425 17.275 14.25 17.35 14.05 17.35C13.85 17.35 13.675 17.2667 13.525 17.1Z" />
                                    </g>
                                </svg>
                                <div class="display-helper__input-wrapper">
                                    <span class="display-helper__input-name">Улица прибытия <span class="c-cancel">*</span></span>
                                    <input type="text" class="input display-helper__input" placeholder="пр. Октября" v-model="orderInfo.streetTo">
                                    <span class="display-helper__input-error">{{ errors.streetTo }}</span>
                                </div>
                            </div>
                            <div class="display-helper__from-to">
                                <div class="display-helper__input-wrapper">
                                    <span class="display-helper__input-name">Номер дома отправления <span class="c-cancel">*</span></span>
                                    <input type="number" class="input display-helper__input" placeholder="52" v-model="orderInfo.houseFrom">
                                    <span class="display-helper__input-error">{{ errors.houseFrom }}</span>
                                </div>
                                <svg class="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <mask id="mask0_1_244" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                                        <rect width="24" height="24" fill="#D9D9D9" />
                                    </mask>
                                    <g mask="url(#mask0_1_244)">
                                        <path class="icon__accent" d="M13.525 17.1C13.375 16.95 13.3 16.7707 13.3 16.562C13.3 16.354 13.375 16.175 13.525 16.025L16.825 12.75H5.05005C4.83338 12.75 4.65438 12.679 4.51305 12.537C4.37105 12.3957 4.30005 12.2167 4.30005 12C4.30005 11.7833 4.37105 11.604 4.51305 11.462C4.65438 11.3207 4.83338 11.25 5.05005 11.25H16.825L13.5 7.94999C13.3667 7.79999 13.3 7.62499 13.3 7.42499C13.3 7.22499 13.375 7.04999 13.525 6.89999C13.675 6.73333 13.85 6.64999 14.05 6.64999C14.25 6.64999 14.4334 6.73333 14.6 6.89999L19.075 11.375C19.1584 11.4583 19.221 11.554 19.263 11.662C19.3044 11.7707 19.325 11.8833 19.325 12C19.325 12.1167 19.3044 12.229 19.263 12.337C19.221 12.4457 19.1584 12.5417 19.075 12.625L14.575 17.125C14.425 17.275 14.25 17.35 14.05 17.35C13.85 17.35 13.675 17.2667 13.525 17.1Z" />
                                    </g>
                                </svg>
                                <div class="display-helper__input-wrapper">
                                    <span class="display-helper__input-name">Номер дома прибытия <span class="c-cancel">*</span></span>
                                    <input type="number" class="input display-helper__input" placeholder="176" v-model="orderInfo.houseTo">
                                    <span class="display-helper__input-error">{{ errors.houseTo }}</span>
                                </div>
                            </div>
                            <div class="display-helper__from-to">
                                <div class="display-helper__input-wrapper">
                                    <span class="display-helper__input-name">Дата отправления <span class="c-cancel">*</span></span>
                                    <input type="datetime-local" :min="new Date()" class="input display-helper__input" v-model="orderInfo.dateFrom">
                                    <span class="display-helper__input-error">{{ errors.dateFrom }}</span>
                                </div>
                                <svg class="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <mask id="mask0_1_244" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                                        <rect width="24" height="24" fill="#D9D9D9" />
                                    </mask>
                                    <g mask="url(#mask0_1_244)">
                                        <path class="icon__accent" d="M13.525 17.1C13.375 16.95 13.3 16.7707 13.3 16.562C13.3 16.354 13.375 16.175 13.525 16.025L16.825 12.75H5.05005C4.83338 12.75 4.65438 12.679 4.51305 12.537C4.37105 12.3957 4.30005 12.2167 4.30005 12C4.30005 11.7833 4.37105 11.604 4.51305 11.462C4.65438 11.3207 4.83338 11.25 5.05005 11.25H16.825L13.5 7.94999C13.3667 7.79999 13.3 7.62499 13.3 7.42499C13.3 7.22499 13.375 7.04999 13.525 6.89999C13.675 6.73333 13.85 6.64999 14.05 6.64999C14.25 6.64999 14.4334 6.73333 14.6 6.89999L19.075 11.375C19.1584 11.4583 19.221 11.554 19.263 11.662C19.3044 11.7707 19.325 11.8833 19.325 12C19.325 12.1167 19.3044 12.229 19.263 12.337C19.221 12.4457 19.1584 12.5417 19.075 12.625L14.575 17.125C14.425 17.275 14.25 17.35 14.05 17.35C13.85 17.35 13.675 17.2667 13.525 17.1Z" />
                                    </g>
                                </svg>
                                <div class="display-helper__input-wrapper">
                                    <span class="display-helper__input-name">Дата прибытия <span class="c-cancel">*</span></span>
                                    <input type="datetime-local" min="18.05.2023" class="input display-helper__input" v-model="orderInfo.dateTo">
                                    <span class="display-helper__input-error">{{ errors.dateTo }}</span>
                                </div>
                            </div>
                            <div class="checkboxes create-form__checkboxes">
                                <div class="checkbox">
                                    <input type="checkbox" id="perish" v-model="orderInfo.perish">
                                    <label for="perish" class="checkbox__name">Скоропортящаяся продукция</label>
                                </div>
                                <div class="checkbox">
                                    <input type="checkbox" id="fragil" v-model="orderInfo.fragil">
                                    <label for="fragil" class="checkbox__name">Хрупкая продукция</label>
                                </div>
                            </div>
                            <div class="display-helper__description">
                                <span class="display-helper__input-name">Комментарий (не более 512 символов)</span>
                                <textarea class="input display-helper__input display-helper__textarea" placeholder="Напишите комментарий" v-model="orderInfo.description"></textarea>
                                <span class="display-helper__input-error">{{ errors.description }}</span>
                            </div>
                        </div>
                        <div class="display-helper__col create-form__col">
                            <div class="display-helper__weight">
                                <span class="display-helper__input-name">Вес</span>
                                <div class="display-helper__inputs">
                                    <input type="number" class="input display-helper__input" placeholder="1" v-model="orderInfo.weight">
                                    <select class="input" v-model="orderInfo.weightUnit">
                                        <option value="т">т</option>
                                        <option value="кг">кг</option>
                                    </select>
                                </div>
                                <span class="display-helper__input-error">{{ errors.weight }}</span>
                            </div>
                            <div class="display-helper__volume">
                                <span class="display-helper__input-name">Объем в литрах</span>
                                <input type="number" class="input display-helper__input" placeholder="200" v-model="orderInfo.volume">
                                <span class="display-helper__input-error">{{ errors.volume }}</span>
                            </div>
                            <div class="display-helper__height">
                                <span class="display-helper__input-name">Длина в метрах</span>
                                <input type="number" class="input display-helper__input" placeholder="4" v-model="orderInfo.height">
                                <span class="display-helper__input-error">{{ errors.height }}</span>
                            </div>
                            <div class="display-helper__price">
                                <span class="display-helper__input-name">Цена в рублях <span class="c-cancel">*</span></span>
                                <input type="text" class="input display-helper__input" placeholder="10000" v-model="orderInfo.price">
                                <span class="display-helper__input-error">{{ errors.price }}</span>
                            </div>
                            <div class="display-helper__formate">
                                <span class="display-helper__input-name">Формат <span class="c-cancel">*</span></span>
                                <select class="input display-helper__input" v-model="orderInfo.view">
                                    <option value="public">биржевая</option>
                                    <option value="private">предложение</option>
                                </select>
                            </div>
                            <div v-if="orderInfo.view == 'private'" class="display-helper__reciever">
                                <span class="display-helper__input-name">ID получателя <span class="c-cancel">*</span></span>
                                <input type="number" class="input display-helper__input" placeholder="125" v-model="orderInfo.offerToUserId">
                                <span class="display-helper__input-error">{{ errors.offerToUserId }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="display-helper-actions">
                        <button :class="{'btn': true, 'btn_hover': !orderCreated, 'display-helper__btn': true}" @click="createOrder()" :disabled="orderCreated">{{ orderCreated ? 'Создана ✓' : 'Создать' }}
                        </button>
                        <button class="btn btn_hover display-helper__btn" @click="clearData()">Очистить</button>
                    </div>
                </div>
            </div>
        </main>
    </div>`
}
const AcceptedClient = {
    computed: {
        getAcceptedClientOrders() {
            return this.$store.getters.getAcceptedClientOrders
        }
    },
    template: `
    <div class="main-component__wrapper">
        <main class="completed main-component br10">
            <div class="container">
                <h1 class="title fw700">Принятые заявки</h1>
                <div class="orders completed__inner">
                    <v-order
                    v-for="order in getAcceptedClientOrders"
                    :key="order.id"
                    :order="order"
                    orderPlace="accepted-client">
                    </v-order>
                    <div v-if="!getAcceptedClientOrders.length">Заявок нет :(</div>
                </div>
            </div>
        </main>
    </div>`
}
const Archive = {
    computed: {
        getArchiveOrders() {
            return this.$store.getters.getArchiveOrders
        }
    },
    template: `
    <div class="main-component__wrapper">
        <main class="completed main-component br10">
            <div class="container">
                <h1 class="title fw700">Архив</h1>
                <div class="orders completed__inner">
                    <v-order
                    v-for="order in getArchiveOrders"
                    :key="order.id"
                    :order="order"
                    orderPlace="archive">
                    </v-order>
                    <div v-if="!getArchiveOrders.length">Заявок нет :(</div>
                </div>
            </div>
        </main>
    </div>`
}
store.dispatch('fetchUserData').then(() => {
    userData = store.getters.getUserData
    const app = Vue.createApp({
        data() {
            return {
                message: 'Hello world!'
            }
        },
        mounted() {
            this.$store.dispatch('fetchOrders', false)
        }
    })
    let routes = []
    switch (userData.role) {
        case 'driver': {
            routes = [
                { path: '/', component: Market },
                { path: '/orders/:id', component: ViewOrder },
                { path: '/offers', component: Offers },
                { path: '/accepted', component: Accepted },
                { path: '/completed', component: Completed },
            ]
            break
        }
        case 'client': {
            routes = [
                { path: '/', component: Market },
                { path: '/orders/:id', component: ViewOrder },
                { path: '/in-search', component: InSearch },
                { path: '/create', component: Create },
                { path: '/accepted', component: AcceptedClient },
                { path: '/archive', component: Archive },
            ]
            break
        }
    }
    // Маршрутизация
    const router = VueRouter.createRouter({
        history: VueRouter.createWebHashHistory(),
        routes
    })
    // Регистрация компонентов
    const vHeader = app.component('v-header', Header)
    const vMinProfile = vHeader.component('v-min-profile', MinProfile)
    const vMinProfileDropdown = vHeader.component('v-min-profile-dropdown', MinProfileDropdown)

    const vSidebar = app.component('v-sidebar', Sidebar)

    const vNotifs = app.component('v-notifs', Notifs)
    const vNotif = app.component('v-notif', Notif)

    const vOffers = app.component('v-offers', Offers)

    const vOrder = app.component('v-order', Order)

    const vMarket = app.component('v-market', Market)

    const vFilters = app.component('v-filters', Filters)
    const vSort = app.component('v-sort', Sort)
    const vSearch = app.component('v-search', Search)

    const vAccepted = app.component('v-accepted', Accepted)

    const vCompleted = app.component('v-completed', Completed)

    const vViewOrder = app.component('v-view-order', ViewOrder)

    const vInSearch = app.component('v-in-search', InSearch)

    const vCreate = app.component('v-create', Create)

    const vAcceptedClient = app.component('v-accepted-client', AcceptedClient)

    const vArchive = app.component('v-archive', Archive)

    // Подключение Vuex и Vue Router. Создание веб-приложения в элементе #app
    app.use(store)
    app.use(router)
    app.mount('#app')
})