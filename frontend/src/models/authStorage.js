const ACCESS_KEY = 'pune-scenes.access'
const REFRESH_KEY = 'pune-scenes.refresh'

export const authStorage = {
  getAccess: () => sessionStorage.getItem(ACCESS_KEY),
  getRefresh: () => sessionStorage.getItem(REFRESH_KEY),
  save: ({ access, refresh }) => {
    if (access) sessionStorage.setItem(ACCESS_KEY, access)
    if (refresh) sessionStorage.setItem(REFRESH_KEY, refresh)
  },
  clear: () => {
    sessionStorage.removeItem(ACCESS_KEY)
    sessionStorage.removeItem(REFRESH_KEY)
  },
}
