import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { useEffect, useState } from "react";

const CLIENT_ID = "Ov23libwtvc52IO3SEG0";

function App() {
  const [rerender, setRerender] = useState(false);
  const [userData, setUserData] = useState({});
  const [repos, setRepos] = useState([]);

  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const codeParam = urlParams.get("code");
    console.log(codeParam);

    if (codeParam && localStorage.getItem("accessToken") === null) {
      async function getAccessToken() {
        await fetch("http://localhost:4000/getAccessToken?code=" + codeParam, {
          method: "GET",
        })
          .then((response) => response.json())
          .then((data) => {
            console.log(data);
            if (data.access_token) {
              localStorage.setItem("accessToken", data.access_token);
              setRerender(!rerender);
            }
          });
      }
      getAccessToken();
    }
  }, []);

  async function getUserData() {
    await fetch("http://localhost:4000/getUserData", {
      method: "GET",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("accessToken"),
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setUserData({ ...userData, profile: data });
      });
  }

  async function getUserRepos() {
    await fetch("http://localhost:4000/getUserRepos", {
      method: "GET",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("accessToken"),
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setRepos(data);
      });
  }

  function loginWithGithub() {
    window.location.assign(
      "https://github.com/login/oauth/authorize?client_id=" +
        CLIENT_ID +
        "&scope=repo"
    );
  }

  async function cloneRepository(repoUrl, repoName) {
    await fetch("http://localhost:4000/cloneRepo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ repoUrl, repoName }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.message);
        alert(data.message);
      });
  }

  return (
    <div className="App">
      <header className="App-header">
        {localStorage.getItem("accessToken") ? (
          <>
            <h1>We have the access token</h1>
            <button
            className="btn btn-danger"
              onClick={() => {
                localStorage.removeItem("accessToken");
                setRerender(!rerender);
              }}
            >
              Log out
            </button>
            <h3>Get User Data from Github API</h3>
            <button className="btn btn-primary" onClick={getUserData}>Get User Data</button>
            {userData.profile ? (
              <>
                <h4>Hello, {userData.profile.login}</h4>
                <img
                  alt=""
                  width="100px"
                  height="100px"
                  src={userData.profile.avatar_url}
                />
                <a className="btn btn-primary" href={userData.profile.html_url} style={{ color: "white" }}>
                  Visit Profile
                </a>
              </>
            ) : null}
            <h3>Get All Repositories:</h3>
            <button className="btn btn-success" onClick={getUserRepos}>Get Repositories</button>
            {repos.length > 0 ? (
              <div>
                <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>Repo Name</th>
                    <th>Access Link</th>
                    <th>Type</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {repos.map((repo) => (
                    <tr key={repo.id}>
                      <td>{repo.name}</td>
                      <td>
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Click Here
                        </a>
                      </td>
                      <td>{repo.private ? "Private" : "Public"}</td>
                      <td>
                        <button
                          className="btn btn-primary"
                          onClick={() =>
                            cloneRepository(repo.clone_url, repo.name)
                          }
                        >
                          Clone Repository
                        </button>
                      </td>
                    </tr> 
                  ))}
                </tbody>
              </table>
              </div>
            ) : (
              <p>No repositories found</p>
            )}
          </>
        ) : (
          <>
            <h3>User is not logged in</h3>
            <button className="btn btn-primary" onClick={loginWithGithub}>Login to Github</button>
          </>
        )}
      </header>
    </div>
  );
}

export default App;
