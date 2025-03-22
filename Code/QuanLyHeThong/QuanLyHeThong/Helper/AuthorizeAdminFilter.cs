using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace QuanLyHeThong.Helper
{
    public class AuthorizeAdminFilter : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            if (HttpContext.Current.Session["AdminUser"] == null)
            {
                filterContext.Result = new RedirectResult("~/Home/Login");
            }

            base.OnActionExecuting(filterContext);
        }
    }
}