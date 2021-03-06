const User = require("../models/User")
const bcryptjs = require("bcryptjs")
const jwt = require("jsonwebtoken")
const nodemailer = require("nodemailer")
const crypto = require("crypto")
const Address = require("../models/Address")
const emailer = require("../config/emailer")

const userController = {
  newUser: async (req, res) => {
    let {firstName, lastName, email, password, google, country, admin} =
      req.body

    country ? country : (country = "none")
    console.log(req.body)
    let photo = req.body.photo
      ? req.body.photo
      : req.file?.filename ||
        "205ffd00-61b4-405b-b77a-25782821b6e2-1642613596185.png"

    console.log(req.body)
    try {
      const userExist = await User.findOne({email})

      if (userExist) {
        if (google) {
          const contraseñaHasheada = bcryptjs.hashSync(password, 10)
          userExist.password = contraseñaHasheada
          userExist.emailVerified = true
          userExist.google = true
          userExist.save()
          res.json({
            success: true,
            message: "You can login with Google",
          })
        } else {
          res.json({
            success: false,
            response: "Username already in use",
          })
        }
      } else {
        var uniqueString = crypto.randomBytes(15).toString("hex")

        let emailVerified = false

        const contraseñaHasheada = bcryptjs.hashSync(password, 10)

        const nuevoUsuario = new User({
          firstName,
          lastName,
          email,
          password: contraseñaHasheada,
          uniqueString,
          emailVerified,
          photo,
          country,
          google,
          admin,
        })

        const token = jwt.sign({...nuevoUsuario}, process.env.SECRETKEY)

        if (google === true) {
          nuevoUsuario.emailVerified = true
          nuevoUsuario.google = true
          nuevoUsuario.isConected = false
          nuevoUsuario.photo = req.body.photo
          await nuevoUsuario.save()
          res.json({
            success: true,
            response: {token, nuevoUsuario},
            message: "Awesome! You created your account with Google",
          })
        } else {
          emailVerified = false
          nuevoUsuario.google = false
          nuevoUsuario.isConected = false
          await nuevoUsuario.save()
          if (email && uniqueString)
            await emailer.sendEmail(email, uniqueString)

          res.json({
            success: true,
            response: {token, nuevoUsuario},
            message:
              "We sent you an email to verify your account, please check your inbox.",
          })
        }
      }
    } catch (error) {
      console.log(error)
      res.json({success: false, response: null, errors: "errors"})
    }
  },
  logUser: async (req, res) => {
    const {email, password, isGoogle} = req.body
    console.log(req.body)
    try {
      let user = await User.findOne({email})
      console.log(user)
      if (user) {
        let samePassword = bcryptjs.compareSync(password, user.password)

        if (user && samePassword) {
          const token = jwt.sign({user}, process.env.SECRETKEY)
          res.json({
            success: true,
            user: user,
            errors: null,
            token: token,
          })
        } else if (user.google && !isGoogle) {
          res.json({
            success: false,
            user: null,
            errors: "Invalid Email",
          })
        } else {
          res.json({
            success: false,
            user: null,
            errors: "Invalid Email or Password",
          })
        }
      } else {
        res.json({
          success: false,
          user: null,
          errors: "No encuentra el usuario",
        })
      }
    } catch (e) {
      res.json({success: false, errors: e.message, user: null})
    }
  },
  token: (req, res) => {
    res.json({user: req.user})
  },
  getUsers: async (req, res) => {
    try {
      let users = await User.find()
      res.json({success: true, error: null, response: users})
    } catch (e) {
      res.json({success: false, error: e, response: null})
      console.error(e)
    }
  },
  getUser: async (req, res) => {
    let id = req.params.id
    try {
      let user = await User.findOne({_id: id})
      res.json({success: true, error: null, response: user})
    } catch (e) {
      res.json({success: false, error: e, response: null})
      console.error(e)
    }
  },
  modifyUser: async (req, res) => {
    const id = req.params.id
    console.log(id)
    User.findOneAndUpdate(
      {
        _id: id,
      },
      {
        $set: req.body.modifierData,
      },
      {
        new: true,
      }
    )
      .then((response) => {
        console.log(response)
        res.json({success: true, response: response})
      })
      .catch((err) => {
        res.json({success: false, response: err})
      })
  },
  getUsersLimited: async (req, res) => {
    let limit = req.body.limit
    try {
      const usersList = await User.find().sort({_id: -1}).limit(limit)
      res.json({success: true, response: usersList})
    } catch (error) {
      console.log(error)
      res.json({success: false, response: error.message})
    }
  },
  getAddresses: async (req, res) => {
    try {
      const usersList = await Address.find().populate("users")
      res.json({success: true, response: usersList})
    } catch (error) {
      console.log(error)
      res.json({success: false, response: error.message})
    }
  },
  deleteUser: async (req, res) => {
    const {id} = req.body
    try {
      let deletedUser = await User.findOneAndDelete({_id: id})
      res.json({success: true, error: null, response: deletedUser})
    } catch (e) {
      res.json({success: false, error: e, response: null})
      console.error(e)
    }
  },
  authUser: (req, res) => {
    try {
      const userAuth = req.user
      res.json({success: true, response: userAuth, error: null})
    } catch (e) {
      res.json({success: false, response: null, error: e})
    }
  },
  verifyEmail: async (req, res) => {
    const {uniqueString} = req.params

    const user = await User.findOne({uniqueString: uniqueString})
    if (user) {
      user.emailVerified = true
      await user.save()
      res.redirect("https://hexagon-techstore.herokuapp.com/")
    } else {
      res.json({success: false, response: "Your e-mail hasn't been verified."})
    }
  },
  byGoogle: async (req, res) => {
    const grupo = await User.aggregate([
      {
        $group: {
          _id: {
            $add: [
              {$dayOfYear: "$createdAt"},
              {$multiply: [400, {$year: "$createdAt"}]},
            ],
          },
          usersThisDay: {$sum: 1},
          first: {$min: "$createdAt"},
        },
      },
      {$sort: {_id: -1}},
      {$limit: 15},
      {$project: {date: "$first", usersThisDay: 1, _id: 0}},
    ])
    console.log(grupo)
    res.json(grupo)
  },
  newAddress: async (req, res) => {
    let {country, state, city, name, address, phone} = req.body

    try {
      const newAddressDirection = new Address({
        country,
        state,
        city,
        name,
        address,
        phone,
        user: req.user._id,
      })

      await newAddressDirection.save()
      res.json({
        success: true,
        response: newAddressDirection,
        message: "New address registered",
      })
    } catch (error) {
      console.log(error)
      res.json({success: false, response: null, errors: error})
    }
  },
  checkAddress: async (req, res) => {
    console.log("si")
    console.log(req.user._id)
    let address = await Address.findOne({user: req.user._id})
    console.log(address)

    res.json({
      success: true,
      response: address,
      errors: null,
    })
  },
  getAddress: async (req, res) => {
    const address = req.params.address
    Address.findOne({user: address})
      .then((address) =>
        res.json({
          success: true,
          response: address,
          errors: null,
        })
      )
      .catch((err) =>
        res.json({
          success: false,
          response: null,
          errors: err.message,
        })
      )
  },
}

module.exports = userController

/* 
  const firstName = useRef()
  const lastName = useRef()
  const password = useRef()
  const emailVerified = useRef()
  const email = useRef()
  const photo = useRef()
  const country = useRef()
  const admin = useRef()
  const google = useRef() */
