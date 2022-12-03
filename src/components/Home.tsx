import React, { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { isTemplateExpression } from "typescript";

interface User {
  id: number;
  name: string;
  email: string;
  state: any;
}

interface CreateUser {
  name: string;
  email: string;
  state: any;
}

const Home = () => {
  const [usersList, setUsersList] = useState<User[]>();
  const [userID, setUserID] = useState<Number>(0);
  const [userName, setUserName] = useState<string>("");
  const [userNameVerif, setUserNameVerif] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userEmailVerif, setUserEmailVerif] = useState<string>("");
  const [userState, setUserState] = useState<any>(false);
  const [userStateVerif, setUserStateVerif] = useState<any>(false);
  const [addUser, setAddUser] = useState<any>(false);
  const [addUserState, setAddUserState] = useState<any>(false);
  const [alert, setAlert] = useState<string>("");

  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = async () => {
    await axios
      .get("http://localhost:8000/api/users")
      .then((res: AxiosResponse) => {
        setUsersList(res.data.users);
      })
      .catch((err: Error) => {
        console.log(err);
      });
  };

  const updateUser = async (e: any) => {
    e.preventDefault();
    type user = {
      name?: string;
      email?: string;
      state?: boolean;
    };
    const url: string = `http://localhost:8000/api/users/${userID}`;
    let newUser: user = {};

    //----------comprobaciones----------
    // si no realizo cambios => si estan vacias => si el mail no tiene formato
    noChangesVerif(
      userName,
      userNameVerif,
      userEmail,
      userEmailVerif,
      userState,
      userStateVerif
    )
      .then(() => {
        emptyInputVerif(userName.trim(), userEmail.trim())
          .then(() => {
            emailFormatVerif(userEmail)
              .then(async () => {
                //hace más liviano el body
                if (userName !== userNameVerif) newUser.name = userName;
                if (userEmail !== userEmailVerif) newUser.email = userEmail;
                if (userState !== userStateVerif) newUser.state = userState;
                console.log(newUser);
                await axios
                  .put(url, newUser)
                  .then((res) => {
                    console.log(res);
                    window.location.reload()
                  })
                  .catch((err) => console.log(err.response.data));
              })
              .catch((err) => {
                setAlert(err);
                console.log(err);
              });
          })
          .catch((err) => {
            setAlert(err);
            console.log(err);
          });
      })
      .catch((err) => {
        setAlert(err);
        console.log(err);
      });

    emptyInputVerif(userName.trim(), userEmail.trim())
      .then(async () => {})
      .catch((err) => {
        setAlert(err);
        console.log(err);
      });
  };

  function noChangesVerif(
    userName: string | undefined,
    originName: string | undefined,
    userEmail: string | undefined,
    originEmail: string | undefined,
    userState: boolean,
    originState: boolean
  ) {
    return new Promise((resolve, reject) => {
      if (
        userName == originName &&
        userEmail == originEmail &&
        userState == originState
      ) {
        reject("No realizó cambios");
      } else resolve(true);
    });
  }

  function emptyInputVerif(
    userName: string | undefined,
    userEmail: string | undefined
  ) {
    return new Promise((resolve, reject) => {
      if (userName && userEmail) resolve(true);
      else reject("Complete los campos vacíos");
    });
  }

  function emailFormatVerif(userEmail: string) {
    return new Promise((resolve, reject) => {
      if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(userEmail)) {
        resolve(true);
      } else reject("El mail es incorrecto");
    });
  }

  function resetUser() {
    setUserID(0);
    setUserName("");
    setUserNameVerif("");

    setUserEmail("");
    setUserEmailVerif("");

    setAlert("");
  }

  const postUser = async (e: any) => {
    e.preventDefault();
    const url = "http://localhost:8000/api/users";
    const name = e.target.name.value.trim();
    const email = e.target.email.value.trim().toLowerCase();
    console.log(`${name} ${email} ${addUserState}`);
    let emailVerif: Array<string | any> = [];
    
    //esoy inteando berificar si el array esta vacio o no

    const user: CreateUser = {
      name: name,
      email: email,
      state: addUserState,
    };
    emptyInputVerif(name, email)
      .then(() => {
        emailFormatVerif(email)
          .then(async () => {
            await axios
              .post(url, user)
              .then((res) => {
                console.log(res);
                setAddUser(false);
                window.location.reload()
              })
              .catch((err) => {
                console.log(err.response.data);
              });
          })
          .catch((err) => {
            setAlert(err);
          });
      })
      .catch((err) => {
        setAlert("Complete todos los campos");
      });
  };

  const deleteUser = async (e: any) => {
    const id = e.target.attributes.getNamedItem("data-id").value;
    const url: string = `http://localhost:8000/api/users/${id}`;
    await axios
      .delete(url)
      .then((res) => {
        console.log(res);
        window.location.reload()
      })
      .catch((err) => console.log(err));
  };

  const handleEditUser = async (e: any) => {
    const id = await e.target.attributes.getNamedItem("data-id").value;
    const name = await e.target.attributes.getNamedItem("data-name").value;
    const email = await e.target.attributes.getNamedItem("data-email").value;
    const state = await e.target.attributes.getNamedItem("data-state").value;
    if (userID !== id) {
      setUserID(id);
      setUserName(name);
      setUserNameVerif(name);

      setUserEmail(email);
      setUserEmailVerif(email);

      console.log(state);
      if(state == 'true') {
        setUserStateVerif(true);
      }
      else {
        setUserStateVerif(false);
      }

      setAddUser(false);
    }
  };

  return (
    <div>
      <h1 className="text-5xl font-semibold mb-8 text-slate-600">Users</h1>
      <div className="grid grid-cols-4 text-center w-fit text-slate-300">
        <div className="rounded-tl-xl border  w-60">ID</div>
        <div className="border  w-60">Nombre</div>
        <div className="border w-60">Mail</div>
        <div className="rounded-tr-xl border w-60">Estado</div>
      </div>
      <div className="">
        {usersList ? (
          usersList.map((item, i) => {
            if (userID == item.id)
              return (
                <div className="relative w-fit" key={i}>
                  <form
                    className="grid grid-cols-4 text-center w-fit text-slate-500"
                    onSubmit={updateUser}
                    id="user-info-form"
                  >
                    <div className=" border border-t-0 w-60 [&>:nth-child(last)]::rounded-xl">
                      {item.id}
                    </div>
                    <input
                      className="border border-t-0 w-60 placeholder:text-center"
                      type="text"
                      value={userName}
                      name="name"
                      onChange={(e) => {
                        setUserName(e.target.value);
                      }}
                    />

                    <input
                      className="border border-t-0 w-60 placeholder:text-center"
                      type="email"
                      value={userEmail}
                      name="email"
                      onChange={(e) => {
                        setUserEmail(e.target.value.toLowerCase());
                      }}
                    />

                    <input
                      className="border border-t-0 w-40"
                      type="checkbox"
                      name="state"
                      onChange={(e) => {
                        userState ? setUserState(false) : setUserState(true) 
                      }}
                      value={userState}
                    />
                  </form>
                  {alert ? (
                    <div className="text-red-400 border pl-2">{alert}</div>
                  ) : (
                    ""
                  )}
                  <div className="absolute top-px left-full flex">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-6 h-6"
                      onClick={resetUser}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    <button form="user-info-form" type="submit">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            else
              return (
                <div className="relative w-fit hover:cursor-default" key={i}>
                  <div className="grid grid-cols-4 text-center w-fit text-slate-500 ">
                    <div className=" border border-t-0 w-60 [&>:nth-child(last)]::rounded-xl">
                      {item.id}
                    </div>
                    <div className="border border-t-0 w-60">{item.name}</div>
                    <div className="border border-t-0 w-60">{item.email}</div>
                    <div className="border border-t-0 w-60">
                      {item.state.toString()}
                    </div>
                  </div>

                  <div className="absolute top-px left-full flex">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="lightgrey"
                      className="w-4 ml-1"
                      onClick={handleEditUser}
                      data-id={item.id}
                      data-name={item.name}
                      data-email={item.email}
                      data-state={item.state}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                      />
                    </svg>

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="lightgrey"
                      className="w-4 ml-1"
                      onClick={deleteUser}
                      data-id={item.id}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                      />
                    </svg>
                  </div>
                </div>
              );
          })
        ) : (
          <div>empty</div>
        )}
        {addUser ? (
          <div className="relative">
            <form
              className="grid grid-cols-4 text-center w-fit text-slate-500"
              onSubmit={postUser}
              id="user-add-form"
            >
              <div className=" border border-t-0 w-60 [&>:nth-child(last)]::rounded-xl">
                -
              </div>
              <input
                className="border border-t-0 w-60 placeholder:text-center"
                type="text"
                placeholder="Nombre"
                name="name"
                required
              />

              <input
                className="border border-t-0 w-60 placeholder:text-center"
                type="email"
                placeholder="email"
                name="email"
                required
              />

              <input
                className="border border-t-0 w-40"
                type="checkbox"
                name="state"
                onChange={(e) => {
                  addUserState ? setAddUserState(false) : setAddUserState(true);
                }}
                value={addUserState}
              />
              {alert ? alert : ""}
            </form>
            <div className="absolute top-px left-full flex">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-6 h-6"
                onClick={() => setAddUser(false)}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <button form="user-add-form" type="submit">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex w-full justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-6 h-6"
              onClick={() => {
                setAddUser(true);
                setUserID(0);
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
