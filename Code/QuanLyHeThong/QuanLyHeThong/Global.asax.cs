using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using DnsClient.Internal;
using Microsoft.Extensions.Logging;
using QuanLyHeThong.DbContext;
using QuanLyHeThong.MongoRepositories.Implementations;
using QuanLyHeThong.MongoRepositories.Interfaces;
using Unity;
using Unity.AspNet.Mvc;
using Unity.Lifetime;
using ILoggerFactory = DnsClient.Internal.ILoggerFactory;
namespace QuanLyHeThong
{
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
            var container = new UnityContainer();
            container.RegisterType<IProductRepository, ProductRepository>();
            container.RegisterType<IAuthService, AuthService>();
            container.RegisterType<ICategoryRepository, CategoryRepository>();
            container.RegisterType<IDiscountRepository, DiscountRepository>();
            container.RegisterType<IImageRepository, ImageRepository>();
            DependencyResolver.SetResolver(new UnityDependencyResolver(container));
        }
    }
}
