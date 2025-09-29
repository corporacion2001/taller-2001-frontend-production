import { FiEdit2 } from "react-icons/fi";
import UserListAvatar from "../ui/userListAvatar/UserListAvatar";
const UserTable = ({ users, onEdit, styles }) => {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.usersTable}>
        <thead>
          <tr>
            <th></th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Taller</th>
            <th>Roles</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className={styles.avatarCell}>
                    <UserListAvatar
                      id={user.id}
                      name={user.name}
                      lastname={user.lastname1}
                      photoReference={user.photo_reference}
                      size="sm"
                    />
                  </div>
                </td>
                <td className={styles.ellipsis}>
                  <span
                    title={`${user.name} ${user.lastname1} ${
                      user.lastname2 || ""
                    }`.trim()}
                  >
                    {`${user.name} ${user.lastname1} ${
                      user.lastname2 || ""
                    }`.trim()}
                  </span>
                </td>
                <td className={styles.ellipsis}>
                  <span title={user.email}>{user.email}</span>
                </td>
                <td>{user.phone}</td>
                <td className={styles.workshop}>
                  <span className={styles.workshopPill}>
                    {user.workshop ? user.workshop.name : "Principal"}
                  </span>
                </td>
                <td>
                  <div className={styles.rolesContainer}>
                    {user.roles?.length > 0
                      ? user.roles.map((role) => (
                          <span
                            key={`${user.id}-${role.name}`}
                            className={styles.rolePill}
                          >
                            {role.name}
                          </span>
                        ))
                      : "-"}
                  </div>
                </td>
                <td>
                  <span
                    className={`${styles.status} ${
                      user.status_user.name === "Activo"
                        ? styles.active
                        : styles.inactive
                    }`}
                  >
                    {user.status_user.name}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => onEdit(user.id)}
                    className={styles.editButton}
                    aria-label="Editar usuario"
                  >
                    <FiEdit2 />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8">No se encontraron usuarios</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
