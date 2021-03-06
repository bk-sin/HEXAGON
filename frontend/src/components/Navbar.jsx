import React from "react"
import {
  Nav,
  Navbar as Navba,
  Dropdown,
  Badge,
  Button,
  Container,
} from "react-bootstrap"
import {FaShoppingCart} from "react-icons/fa"
import {AiFillDelete} from "react-icons/ai"
import {Link} from "react-router-dom"
import "../styles/Navbar.css"
import modalAction from "../redux/actions/modalAction"
import {connect} from "react-redux"
import authAction from "../redux/actions/authAction"
import {useCart} from "react-use-cart"

const Navbar = (props) => {
  const {removeItem, totalItems, items} = useCart()

  return (
    <>
      <div className="nav-container" style={{zIndex: 100}}>
        <div className="nav-inside">
          <div className="nav__loco--container">
            <img
              src="../../assets/logo_notext.svg"
              alt="logo"
              className="nav__logo"
            />
            <div className="nav__logo--text">
              <Link to="/" className="nav__title">
                HEXAGON
              </Link>
              <p className="nav__subtitle">TECHSTORE</p>
            </div>
          </div>
          <Navba expand="lg">
            <Navba.Toggle aria-controls="basic-navbar-nav" />
            <Navba.Collapse id="basic-navbar-nav">
              <Nav>
                <div className="nav__menu--navigation">
                  <button className="custom-btn btn-3">
                    <span>
                      <Link to="/" className="nav__menu--item text-light">
                        Home
                      </Link>
                    </span>
                  </button>
                  <button className="custom-btn btn-3">
                    <span>
                      <Link to="/shop" className="nav__menu--item text-light">
                        Shop
                      </Link>
                    </span>
                  </button>
                  <button className="custom-btn btn-3">
                    <span>
                      <Link
                        to="/contact"
                        className="nav__menu--item text-light"
                      >
                        Contact
                      </Link>
                    </span>
                  </button>

                  {!props.isLoading && props.isAuth ? (
                    <>
                      <button
                        onClick={() => props.logout()}
                        className="custom-btn btn-3"
                      >
                        <span>Log Out</span>
                      </button>
                      <div className="user__info">
                        <div
                          style={{
                            backgroundImage: `url(${
                              props.user?.google
                                ? props.user?.photo
                                : "https://i.imgur.com/o2bJt64.png"
                            })`,
                          }}
                          className="nav__menu__photo"
                        />
                        <p className="user__name">{props.user?.firstName}</p>
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={() => props.showCloseModal()}
                      className="custom-btn btn-3"
                    >
                      <span>Login/Register</span>
                    </button>
                  )}
                  {!props.isLoading && props.isAuth && props.user?.admin && (
                    <Link to={"/admin"}>Admin</Link>
                  )}
                </div>
              </Nav>
            </Navba.Collapse>
          </Navba>

          <Nav className="cart-fixed">
            <Dropdown>
              <Dropdown.Toggle>
                <FaShoppingCart color="white" fontSize="25px" />
                <Badge>{totalItems}</Badge>
              </Dropdown.Toggle>
              <Dropdown.Menu style={{minWidth: 370}} className="cart__dropdown">
                {totalItems ? (
                  <>
                    {items.map((prod) => (
                      <span className="cartItem" key={prod.id}>
                        <img
                          src={prod.image}
                          className="cartItemImg"
                          alt={prod.product}
                          width={100}
                        />

                        <div className="cartItemDetail" style={{gap: 10}}>
                          <span>{prod.product}</span>
                          <span>${prod.price}</span>
                          <span>{prod.quantity}</span>
                        </div>
                        <AiFillDelete
                          fontSize="20px"
                          style={{cursor: "pointer"}}
                          onClick={() => {
                            removeItem(prod.id)
                          }}
                        />
                      </span>
                    ))}
                    <Link to="/cart">
                      <Button style={{width: "95%", margin: "0 10px"}}>
                        Go To Cart
                      </Button>
                    </Link>
                  </>
                ) : (
                  <span style={{padding: 10}}>Cart is Empty</span>
                )}
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </div>
      </div>
    </>
  )
}
const mapStateToProps = (state) => {
  return {
    user: state.authReducer.user,
    isAuth: state.authReducer.isAuth,
    isLoading: state.authReducer.isLoading,
    token: state.authReducer.token,
    productos: state.productoReducer.productos,
  }
}

const mapDispatchToProps = {
  showCloseModal: modalAction.showCloseModal,
  tokenVerify: authAction.tokenVerify,
  logout: authAction.logout,
}

export default connect(mapStateToProps, mapDispatchToProps)(Navbar)
