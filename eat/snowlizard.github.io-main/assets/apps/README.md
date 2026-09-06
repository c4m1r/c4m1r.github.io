# My Vista

This website is inspired by the Windows Vista user interface, a design that, despite initial performance and compatibility challenges, exhibited a distinctive aesthetic amongst its subsequent Windows iterations. This project is independently developed and holds no affiliation with Microsoft. My vista was designed to be used a both a portfolio website and a browser homepage.

## Theme

```json
{
    "username": "Your user name",
    "userIcon": "/assets/ui/pepe.jpg",
    "wallpaper": "/assets/ui/space.jpg"
}
```

The theme can be updated by changing the theme.json file in the public folder.

## Apps

```json
    {
        "title": "Reddit",
        "icon": "https://redditinc.com/hs-fs/hubfs/Reddit%20Inc/Content/Brand%20Page/Reddit_Logo.png",
        "entry": "https://www.reddit.com",
        "type": "external",
        "location": {
            "desktop":false,
            "pinned":false,
            "folder":"Media"
        }
    },
```

You can add apps through the apps.json file located in the public directory. Apps can have two different types “external” or “internal”. External apps will redirect to an external website i.e Reddit. Internal type apps should link to an html file or other static file. Opening internal type apps will open a window within the my vista desktop.

You can add apps to the desktop by setting desktop to true under location. Pinned apps are the first apps shown when opening the start menu. Any app with a folder set to anything other than an empty string will appear inside a folder when opening “All programs” within the start menu.

![](/api/files/0198b0ef-868b-740f-b6f3-f26b2031f526/Screenshot_From_2025-08-15_20-32-18.png)