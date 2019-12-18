


const UserPagePermission = 'USER_CREATE | USER_SELECT';
const RolePagePermission = 'ROLE_CREATE | ROLE_SELECT';
const PermissionPagePermission = 'PERMISSION_CREATE | PERMISSION_SELECT';

const masterRoute = [{
    name: '用户',
    permission: 'USER_CREATE | USER_SELECT | ROLE_CREATE | ROLE_SELECT | PERMISSION_CREATE | PERMISSION_SELECT',
    path: '_user_group',
    icon: 'user',
    allow: false,
    children: [{
        name: '用户',
        permission: UserPagePermission,
        path: '/users',
        icon: 'icon-user',
    },
    {
        name: '角色',
        permission: RolePagePermission,
        path: '/roles',
        icon: 'icon-role',
    },
    {
        name: '权限',
        permission: PermissionPagePermission,
        path: '/permissions',
        icon: 'icon-permission',
    }]
}];


export {
    masterRoute,
    UserPagePermission,
    RolePagePermission,
    PermissionPagePermission
};