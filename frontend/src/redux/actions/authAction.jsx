import axios from "axios"
import {toast} from "react-toastify"
const rootUrl = "https://hexagon-techstore.herokuapp.com/api/"
const tokenAuth = rootUrl + "auth"
const loginUrl = rootUrl + "user/login"
const registerUrl = rootUrl + "user/register"
const allUsers = rootUrl + "user/modificar"
const allUsersByDate = rootUrl + "user/getUsersByDate"

const authAction = {
  loginPending: (email, password) => {
    return (dispatch, getState) => {
      dispatch({
        type: "auth@@GET_USER_PENDING",
      })
    }
  },
  userLogin: (email, password) => {
    return async (dispatch, getState) => {
      try {
        const response = await axios.post(loginUrl, {
          email: email,
          password: password,
          isGoogle: true,
        })
        if (response.data.success) {
          localStorage.setItem("token", response.data.token)
          getState().modalReducer.showModal = false
          toast.success("Welcome Back!", {position: "bottom-right"})
          dispatch({
            type: "auth@@USER",
            payload: {
              user: response.data.user,
              authError: response.data.errors,
              token: response.data.token,
            },
          })
        } else {
          toast.error(response.data.errors, {position: "bottom-right"})
          dispatch({
            type: "auth@@GET_USER_FAIL",
            payload: {
              authError: response.data.errors,
            },
          })
        }
      } catch (error) {
        dispatch({
          type: "auth@@GET_USER_FAIL",
          payload: {
            authError: "Email or password incorrect!",
          },
        })
      }
    }
  },
  userRegister: (formData) => {
    return async (dispatch, getState) => {
      let response = await axios.post(registerUrl, formData)
      if (response.data.success) {
        toast.error(response.data.message)
        getState().modalReducer.showModal = false

        localStorage.setItem("token", response.data.response.token)
        toast.success(
          "Welcome to HEXAGON " + response.data.response.nuevoUsuario.firstName
        )
        dispatch({
          type: "auth@@NEW_USER",
          payload: {
            user: response.data.response.nuevoUsuario,
            token: response.data.response.token,
            authError: response.data.errors,
          },
        })
      } else {
        response.data.errors[0]
          ? response.data.errors.map((err) => toast.error(err.message))
          : toast.error(response.data.message)
        dispatch({
          type: "auth@@GET_USER_FAIL",
          payload: {authError: response.data.errors},
        })
      }
    }
  },

  tokenVerify: () => {
    return async (dispatch, getState) => {
      const token =
        localStorage.getItem("token") || getState().authReducer.token
      try {
        const response = await axios.get(tokenAuth, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        dispatch({
          type: "auth@@GET_USER_SUCCESS",
          payload: {
            user: response.data.user,
            token: token,
            authError: null,
          },
        })
      } catch (error) {
        const token =
          localStorage.getItem("token") || getState().authReducer.token
        if (token) {
          dispatch({
            type: "auth@@GET_USER_FAIL",
            payload: {user: null, token: null, authError: error.message},
          })
        } else {
          dispatch({
            type: "auth@@GET_USER_FAIL",
            payload: {user: null, token: null, authError: "no token"},
          })
        }
      }
    }
  },
  logout: () => {
    localStorage.removeItem("token")
    return (dispatch, getState) => {
      dispatch({type: "auth@@LOGOUT"})
    }
  },
  getUsers: () => {
    return async (dispatch, getState) => {
      const response = await axios.get(allUsers)
      dispatch({type: "auth@@ALL_USERS", payload: response.data.response})
      return response
    }
  },
  getUsersByDate: () => {
    return async (dispatch, getState) => {
      const response = await axios.get(allUsersByDate)
      dispatch({
        type: "auth@@ALL_USERS_BY_DATE",
        payload: response.data,
      })
    }
  },
  newAddress: (country, state, city, name, address, phone) => {
    return async (dispatch, getState) => {
      const token = localStorage.getItem("token")

      let response = await axios.post(
        "https://hexagon-techstore.herokuapp.com/api/address/newAddress",
        {
          country,
          state,
          city,
          name,
          address,
          phone,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      dispatch({
        type: "address@ADDRESS",
        payload: response.data.response,
      })
      return response
    }
  },

  checkAddress: () => {
    return async (dispatch, getState) => {
      const token = localStorage.getItem("token")

      let response = await axios.get(
        "https://hexagon-techstore.herokuapp.com/api/address/newAddress",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      dispatch({
        type: "address@ADDRESS",
        payload: response.data,
      })
      return response
    }
  },
}
export default authAction
