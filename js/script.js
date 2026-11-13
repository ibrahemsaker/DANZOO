      let currentModalProduct = null;
      let selectedProductSize = "";
      let selectedProductColor = "";
      let selectedProductImage = 0;
      let currentModalImages = [];

      const productDetailsModal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById("productDetailsModal"),
      );

      function openProductDetails(productId) {
        const product = products.find(
          (item) => String(item.id) === String(productId),
        );
        if (!product) return;

        currentModalProduct = product;
        selectedProductSize = "";
        selectedProductColor = "";
        selectedProductImage = 0;

        // استخدم صور المنتج المحددة، أو صور منتجات أخرى من نفس القسم كصور إضافية مؤقتة.
        const sameCategoryImages = products
          .filter(
            (item) =>
              item.category === product.category && item.id !== product.id,
          )
          .map((item) => item.image);
        const images =
          product.images && product.images.length
            ? product.images
            : [product.image, ...sameCategoryImages]
                .filter(Boolean)
                .slice(0, 4);
        currentModalImages = images;

        document.getElementById("productDetailsTitle").textContent =
          product.name;
        document.getElementById("modalProductPrice").textContent = formatPrice(
          product.price,
        );
        document.getElementById("modalProductDescription").textContent =
          product.description || "اكتشف تفاصيل هذا المنتج من مجموعة DANZO.";
        document.getElementById("modalProductQuantity").value = 1;

        // مقاسات الأحذية والشربات تختلف عن الشنط والإكسسوارات.
        const defaultSizes = [
          "sneakers",
          "classic",
          "mirror",
          "high-copy",
          "sherbat",
        ].includes(product.category)
          ? ["39", "40", "41", "42", "43", "44"]
          : ["مقاس واحد"];

        const defaultColors = [
          { name: "أسود", value: "#171717" },
          { name: "أبيض", value: "#ffffff" },
          { name: "بيج", value: "#c8b69b" },
          { name: "كحلي", value: "#172b4d" },
        ];

        renderModalImages(images);
        renderModalSizes(product.sizes || defaultSizes);
        renderModalColors(product.colors || defaultColors);

        document.getElementById("selectedSizeText").textContent = "اختر المقاس";
        document.getElementById("selectedColorText").textContent = "اختر اللون";
        productDetailsModal.show();
      }

      function renderModalImages(images) {
        const mainImage = document.getElementById("modalMainImage");
        const thumbnails = document.getElementById("modalProductThumbnails");
        thumbnails.innerHTML = "";

        const validImages = [...new Set((images || []).filter(Boolean))];
        if (!validImages.length) {
          mainImage.removeAttribute("src");
          return;
        }

        mainImage.src = validImages[0];
        mainImage.alt = currentModalProduct
          ? currentModalProduct.name
          : "صورة المنتج";

        validImages.forEach((image, index) => {
          const button = document.createElement("button");
          button.type = "button";
          button.className = `product-thumbnail ${index === 0 ? "active" : ""}`;
          button.setAttribute("aria-label", `عرض الصورة ${index + 1}`);

          const thumbnailImage = document.createElement("img");
          thumbnailImage.src = image;
          thumbnailImage.alt = `صورة ${index + 1}`;
          thumbnailImage.loading = "lazy";
          button.appendChild(thumbnailImage);

          button.addEventListener("click", () => {
            selectedProductImage = index;
            mainImage.src = image;
            thumbnails
              .querySelectorAll(".product-thumbnail")
              .forEach((item, itemIndex) => {
                item.classList.toggle("active", itemIndex === index);
              });
          });

          thumbnails.appendChild(button);
        });
      }

      function renderModalSizes(sizes) {
        const container = document.getElementById("modalSizeOptions");
        container.innerHTML = "";

        sizes.forEach((size) => {
          const value = typeof size === "object" ? size.value : size;
          const label = typeof size === "object" ? size.label : size;
          const button = document.createElement("button");
          button.type = "button";
          button.className = "size-option";
          button.textContent = label;

          button.addEventListener("click", () => {
            selectedProductSize = String(value);
            container
              .querySelectorAll(".size-option")
              .forEach((item) => item.classList.remove("active"));
            button.classList.add("active");
            document.getElementById("selectedSizeText").textContent =
              `المقاس: ${label}`;
          });

          container.appendChild(button);
        });
      }

      function renderModalColors(colors) {
        const container = document.getElementById("modalColorOptions");
        container.innerHTML = "";

        colors.forEach((color) => {
          const name = typeof color === "object" ? color.name : color;
          const value = typeof color === "object" ? color.value : color;
          const button = document.createElement("button");
          button.type = "button";
          button.className = "color-option";
          button.title = name;
          button.setAttribute("aria-label", name);

          const swatch = document.createElement("span");
          swatch.style.backgroundColor = value;
          button.appendChild(swatch);

          button.addEventListener("click", () => {
            selectedProductColor = String(name);
            container
              .querySelectorAll(".color-option")
              .forEach((item) => item.classList.remove("active"));
            button.classList.add("active");
            document.getElementById("selectedColorText").textContent =
              `اللون: ${name}`;
          });

          container.appendChild(button);
        });
      }

      document.getElementById("quantityMinus").addEventListener("click", () => {
        const input = document.getElementById("modalProductQuantity");
        input.value = Math.max(1, (parseInt(input.value, 10) || 1) - 1);
      });

      document.getElementById("quantityPlus").addEventListener("click", () => {
        const input = document.getElementById("modalProductQuantity");
        input.value = Math.min(99, (parseInt(input.value, 10) || 1) + 1);
      });

      document
        .getElementById("modalProductQuantity")
        .addEventListener("change", (event) => {
          const quantity = parseInt(event.target.value, 10) || 1;
          event.target.value = Math.min(99, Math.max(1, quantity));
        });

      document
        .getElementById("modalAddToCart")
        .addEventListener("click", () => {
          if (!currentModalProduct) return;

          if (!selectedProductSize) {
            showToast("من فضلك اختر المقاس أولاً");
            return;
          }
          if (!selectedProductColor) {
            showToast("من فضلك اختر اللون أولاً");
            return;
          }

          const quantity = Math.min(
            99,
            Math.max(
              1,
              parseInt(
                document.getElementById("modalProductQuantity").value,
                10,
              ) || 1,
            ),
          );

          addToCartWithOptions({
            productId: currentModalProduct.id,
            name: currentModalProduct.name,
            price: Number(currentModalProduct.price) || 0,
            image:
              currentModalImages[selectedProductImage] ||
              currentModalProduct.image,
            size: selectedProductSize,
            color: selectedProductColor,
            quantity,
          });

          productDetailsModal.hide();
        });

      /* عدّل رقم واتساب المتجر إلى الرقم الحقيقي */
      const DANZO_WHATSAPP_NUMBER = "201065975524";
      const CURRENCY = "ج.م";

      /* الأقسام */
      const categories = [
        {
          id: "sneakers",
          name: "سنيكرز",
          image:
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=85",
          description: "اكتشف المجموعة",
        },
        {
          id: "classic",
          name: "جزم كلاسيك",
          image:
            "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=700&q=85",
          description: "أناقة في كل خطوة",
        },
        {
          id: "bags",
          name: "شنط",
          image:
            "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=700&q=85",
          description: "اختيارات تناسبك",
        },
        {
          id: "accessories",
          name: "إكسسوارات",
          image:
            "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=700&q=85",
          description: "التفاصيل بتفرق",
        },
        {
          id: "mirror",
          name: "الميرور",
          image: "img/mirror.jpg",
          description: "اكتشف مجموعة الميرور",
        },
        {
          id: "high-copy",
          name: "الهاي كوبي",
          image: "img/high-copy.jpg",
          description: "شوف أحدث الموديلات",
        },
        {
          id: "sherbat",
          name: "الشربات",
          image: "img/sherbat.jpg",
          description: "اختار اللي يناسبك",
        },
      ];

      /* المنتجات - عدّل أسماء الصور والأسعار حسب منتجاتك */
      const products = [
        {
          id: "1",
          category: "sneakers",
          categoryName: "سنيكرز",
          name: "سنيكرز رياضي أحمر",
          price: 1450,
          oldPrice: 1700,
          image:
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=85",
          description: "تصميم عصري وراحة في كل خطوة.",
          badge: "الأكثر مبيعاً",
          rating: "4.9",
        },
        {
          id: "2",
          category: "sneakers",
          categoryName: "سنيكرز",
          name: "سنيكرز أبيض كلاسيك",
          price: 1250,
          image:
            "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=700&q=85",
          description: "ستايل بسيط يناسب كل إطلالاتك.",
          badge: "جديد",
          rating: "4.8",
        },
        {
          id: "3",
          category: "classic",
          categoryName: "جزم كلاسيك",
          name: "حذاء كلاسيك جلد",
          price: 1850,
          image:
            "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=700&q=85",
          description: "اختيار أنيق للمناسبات والإطلالات الرسمية.",
          rating: "4.7",
        },
        {
          id: "4",
          category: "classic",
          categoryName: "جزم كلاسيك",
          name: "حذاء رسمي أسود",
          price: 1650,
          image:
            "https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=700&q=85",
          description: "تصميم راقٍ يناسب المناسبات المختلفة.",
          rating: "4.8",
        },
        {
          id: "5",
          category: "bags",
          categoryName: "شنط",
          name: "شنطة أنيقة",
          price: 1150,
          oldPrice: 1400,
          image:
            "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=700&q=85",
          description: "عملية وأنيقة للاستخدام اليومي.",
          badge: "عرض خاص",
          rating: "4.9",
        },
        {
          id: "6",
          category: "bags",
          categoryName: "شنط",
          name: "شنطة كاجوال",
          price: 950,
          image:
            "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=85",
          description: "اختيار مناسب للخروجات اليومية.",
          rating: "4.6",
        },
        {
          id: "7",
          category: "accessories",
          categoryName: "إكسسوارات",
          name: "حزام جلد أنيق",
          price: 450,
          image:
            "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=700&q=85",
          description: "تفاصيل بسيطة تكمل إطلالتك.",
          rating: "4.7",
        },
        {
          id: "8",
          category: "accessories",
          categoryName: "إكسسوارات",
          name: "ساعة أنيقة",
          price: 1350,
          image:
            "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=700&q=85",
          description: "لمسة مميزة تناسب إطلالتك اليومية.",
          badge: "مميز",
          rating: "4.8",
        },
        {
          id: "9",
          category: "mirror",
          categoryName: "الميرور",
          name: "حذاء ميرور",
          price: 1800,
          image: "img/mirror-product.jpg",
          description: "موديل ميرور بتصميم مميز.",
          badge: "الميرور",
          rating: "5.0",
        },
        {
          id: "10",
          category: "high-copy",
          categoryName: "الهاي كوبي",
          name: "حذاء هاي كوبي",
          price: 1500,
          image: "img/high-copy-product.jpg",
          description: "ستايل مميز من قسم الهاي كوبي.",
          badge: "هاي كوبي",
          rating: "4.9",
        },
        {
          id: "11",
          category: "sherbat",
          categoryName: "الشربات",
          name: "شربات",
          price: 150,
          image: "img/sherbat-product.jpg",
          description: "اختيارات متنوعة من الشربات.",
          badge: "جديد",
          rating: "4.8",
        },
      ];

      const cart = [];
      const favorites = new Set();
      let activeCategory = "all";
      let searchTerm = "";

      document.getElementById("currentYear").textContent =
        new Date().getFullYear();

      function formatPrice(price) {
        return (
          new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(
            price,
          ) +
          " " +
          CURRENCY
        );
      }
      function escapeHTML(value) {
        return String(value).replace(
          /[&<>"']/g,
          (char) =>
            ({
              "&": "&amp;",
              "<": "&lt;",
              ">": "&gt;",
              '"': "&quot;",
              "'": "&#039;",
            })[char],
        );
      }
      let toastTimer;
      function showToast(message) {
        const toast = document.getElementById("danzoToast");
        toast.textContent = message;
        toast.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
      }

      /* رسم الأقسام */
      function renderCategories() {
        document.getElementById("categoriesGrid").innerHTML = categories
          .map(
            (category, index) => `
        <div class="col-6 col-lg-3">
            <a href="#products" class="category-card" data-category-link="${category.id}">
                <img src="${escapeHTML(category.image)}" alt="${escapeHTML(category.name)}" loading="lazy"
                     onerror="this.onerror=null;this.src='https://placehold.co/700x800/101827/72b4ff?text=${encodeURIComponent(category.name)}'">
                <div class="category-info">
                    <small>${String(index + 1).padStart(2, "0")} / COLLECTION</small>
                    <h4>${escapeHTML(category.name)}</h4>
                    <span>${escapeHTML(category.description)}</span>
                </div>
                <i class="fa-solid fa-arrow-left category-arrow"></i>
            </a>
        </div>
    `,
          )
          .join("");

        document.getElementById("footerCategories").innerHTML = categories
          .map(
            (category) => `
        <li><a href="#products" data-footer-filter="${category.id}">${escapeHTML(category.name)}</a></li>
    `,
          )
          .join("");
      }

      /* رسم أزرار الفلترة */
      function renderFilters() {
        const all = [{ id: "all", name: "كل المنتجات" }, ...categories];
        document.getElementById("productFilters").innerHTML = all
          .map(
            (category) => `
        <button class="filter-btn ${category.id === activeCategory ? "active" : ""}" data-filter="${category.id}">
            ${escapeHTML(category.name)}
        </button>
    `,
          )
          .join("");
      }

      /* بطاقة المنتج */
      function productCard(product, options = {}) {
        const isFavorite = favorites.has(product.id);
        const showRemove = options.showRemove === true;
        return `
    <div class="col-6 col-lg-3 product-item" data-product-id="${escapeHTML(product.id)}">
        <div class="product-card">
            <div class="product-image">
                <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}" loading="lazy"
                     onerror="this.onerror=null;this.src='https://placehold.co/700x700/101827/72b4ff?text=${encodeURIComponent(product.name)}'">
                ${product.badge ? `<span class="product-badge">${escapeHTML(product.badge)}</span>` : ""}
                <button type="button" class="product-favorite ${isFavorite ? "liked" : ""}" data-favorite-id="${escapeHTML(product.id)}" aria-label="إضافة للمفضلة" title="إضافة للمفضلة">
                    <i class="${isFavorite ? "fa-solid" : "fa-regular"} fa-heart"></i>
                </button>
                ${
                  !showRemove
                    ? `
               `
                    : ""
                }
            </div>
            <div class="product-info">
                <div class="product-category">${escapeHTML(product.categoryName)}</div>
                <h5 class="product-name">${escapeHTML(product.name)}</h5>
                <p class="product-description">${escapeHTML(product.description || "اختيار مميز من مجموعة DANZO.")}</p>
                <div class="product-rating"><i class="fa-solid fa-star"></i> ${escapeHTML(product.rating || "4.8")}</div>
                <div class="product-bottom">
                    <span class="product-price">${formatPrice(product.price)}</span>
                    ${product.oldPrice ? `<span class="product-old-price">${formatPrice(product.oldPrice)}</span>` : ""}
                </div>
                <div class="product-card-actions">
                    ${
                      showRemove
                        ? `
                    <button type="button" class="btn-view-product" data-view-product="${escapeHTML(product.id)}">
                        <i class="fa-regular fa-eye"></i> عرض المنتج
                    </button>
                    <button type="button" class="btn-remove-favorite" data-remove-favorite="${escapeHTML(product.id)}">
                        <i class="fa-solid fa-heart-crack"></i> إزالة
                    </button>`
                        : `
                    <button type="button" class="btn-add-cart" data-add-cart="${escapeHTML(product.id)}">
                        <i class="fa-solid fa-bag-shopping"></i> إضافة للسلة
                    </button>
                    <button type="button" class="btn-view-product" data-view-product="${escapeHTML(product.id)}">
                        <i class="fa-regular fa-eye"></i> عرض المنتج
                    </button>`
                    }
                </div>
            </div>
        </div>
    </div>`;
      }

      /* عرض المنتجات وتطبيق البحث والفلتر */
      function renderProducts() {
        const filtered = products.filter((product) => {
          const matchesCategory =
            activeCategory === "all" || product.category === activeCategory;
          const text = (
            product.name +
            " " +
            product.categoryName +
            " " +
            product.description
          ).toLowerCase();
          return matchesCategory && text.includes(searchTerm);
        });

        document.getElementById("productsGrid").innerHTML = filtered
          .map((product) => productCard(product))
          .join("");
        document.getElementById("noProducts").style.display = filtered.length
          ? "none"
          : "block";
        document.querySelectorAll(".filter-btn").forEach((button) => {
          button.classList.toggle(
            "active",
            button.dataset.filter === activeCategory,
          );
        });
      }

      /* صفحة المفضلة */
      function renderFavorites() {
        const list = products.filter((product) => favorites.has(product.id));
        document.getElementById("favoritesGrid").innerHTML = list
          .map((product) => productCard(product, { showRemove: true }))
          .join("");
        document.getElementById("favoritesEmpty").style.display = list.length
          ? "none"
          : "block";
        document.getElementById("favoritesSummary").textContent =
          `عدد المنتجات في المفضلة: ${list.length}`;
        document.getElementById("favoriteCount").textContent = favorites.size;
      }

      /* فتح وإغلاق صفحة المفضلة */
      function showFavoritesPage() {
        document.getElementById("favoritesPage").style.display = "block";
        document.getElementById("categories").style.display = "none";
        document.getElementById("products").style.display = "none";
        document.getElementById("offers").style.display = "none";
        document.getElementById("about").style.display = "none";
        document.getElementById("contact").style.display = "none";
        renderFavorites();
        window.scrollTo({ top: 0, behavior: "smooth" });
        const navbar = document.getElementById("mainNavbar");
        if (navbar.classList.contains("show"))
          bootstrap.Collapse.getOrCreateInstance(navbar).hide();
      }
      function showShop() {
        document.getElementById("favoritesPage").style.display = "none";
        document.getElementById("categories").style.display = "";
        document.getElementById("products").style.display = "";
        document.getElementById("offers").style.display = "";
        document.getElementById("about").style.display = "";
        document.getElementById("contact").style.display = "";
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      document
        .getElementById("favoritesBtn")
        .addEventListener("click", showFavoritesPage);
      document.getElementById("backToShop").addEventListener("click", showShop);
      document
        .getElementById("browseProducts")
        .addEventListener("click", () => {
          showShop();
          setTimeout(
            () =>
              document
                .getElementById("products")
                .scrollIntoView({ behavior: "smooth" }),
            100,
          );
        });
      document.getElementById("brandHome").addEventListener("click", showShop);
      document
        .getElementById("footerFavoritesLink")
        .addEventListener("click", (event) => {
          event.preventDefault();
          showFavoritesPage();
        });

      /* الفلاتر وروابط الأقسام */
      document.addEventListener("click", (event) => {
        // الضغط على كارت القسم ينقل لقسم المنتجات ويعرض منتجات القسم المختار
        const categoryLink = event.target.closest("[data-category-link]");
        if (categoryLink) {
          event.preventDefault();
          const categoryId = categoryLink.getAttribute("data-category-link");
          showShop();
          activeCategory = categoryId;
          searchTerm = "";
          renderFilters();
          renderProducts();
          const productsSection = document.getElementById("products");
          if (productsSection) {
            productsSection.style.display = "";
            requestAnimationFrame(() =>
              productsSection.scrollIntoView({
                behavior: "smooth",
                block: "start",
              }),
            );
          }
          return;
        }

        // الضغط على فلتر القسم داخل المنتجات
        const filter = event.target.closest("[data-filter]");
        if (filter) {
          event.preventDefault();
          activeCategory = filter.dataset.filter;
          searchTerm = "";
          renderFilters();
          renderProducts();
          return;
        }

        // روابط الأقسام الموجودة في الفوتر
        const footerFilter = event.target.closest("[data-footer-filter]");
        if (footerFilter) {
          event.preventDefault();
          activeCategory = footerFilter.dataset.footerFilter;
          searchTerm = "";
          showShop();
          renderFilters();
          renderProducts();
          const productsSection = document.getElementById("products");
          if (productsSection) {
            productsSection.style.display = "";
            requestAnimationFrame(() =>
              productsSection.scrollIntoView({
                behavior: "smooth",
                block: "start",
              }),
            );
          }
        }
      });

      /* البحث */
      document.getElementById("searchBtn").addEventListener("click", () => {
        showShop();
        const term = prompt("اكتب اسم المنتج أو القسم الذي تبحث عنه:");
        if (term === null) return;
        searchTerm = term.trim().toLowerCase();
        activeCategory = "all";
        renderProducts();
        document
          .getElementById("products")
          .scrollIntoView({ behavior: "smooth" });
        const count = products.filter((product) =>
          (
            product.name +
            " " +
            product.categoryName +
            " " +
            product.description
          )
            .toLowerCase()
            .includes(searchTerm),
        ).length;
        showToast(
          count
            ? `عدد المنتجات المطابقة: ${count}`
            : "مفيش منتجات مطابقة للبحث",
        );
      });

      /* تحديث حالة القلب في كل بطاقات المنتج */
      function updateFavoriteButtons() {
        document.querySelectorAll("[data-favorite-id]").forEach((button) => {
          const liked = favorites.has(button.dataset.favoriteId);
          button.classList.toggle("liked", liked);
          const icon = button.querySelector("i");
          icon.classList.toggle("fa-solid", liked);
          icon.classList.toggle("fa-regular", !liked);
        });
        document.getElementById("favoriteCount").textContent = favorites.size;
      }

      /* سلة المشتريات */
      const cartModal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById("danzoCartModal"),
      );
      const cartCountElement = document.getElementById("cartCount");
      const cartEmpty = document.getElementById("cartEmpty");
      const cartContent = document.getElementById("cartContent");
      const cartItemsElement = document.getElementById("cartItems");
      const cartTotalElement = document.getElementById("cartTotal");

      function getCartItem(key) {
        return cart.find(
          (item) => item.cartKey === String(key) || item.id === String(key),
        );
      }
      function getCartQuantity() {
        return cart.reduce((sum, item) => sum + item.quantity, 0);
      }
      function getCartTotal() {
        return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      }
      function updateCartCount() {
        cartCountElement.textContent = getCartQuantity();
      }

      function addToCart(id) {
        const product = products.find((item) => item.id === String(id));
        if (!product) return;

        const cartKey = `${product.id}||`;
        const existing = cart.find((item) => item.cartKey === cartKey);
        if (existing) {
          existing.quantity = Math.min(99, existing.quantity + 1);
        } else {
          cart.push({
            cartKey,
            id: product.id,
            productId: product.id,
            name: product.name,
            price: Number(product.price) || 0,
            image: product.image,
            size: "",
            color: "",
            quantity: 1,
          });
        }

        updateCartCount();
        renderCart();
        showToast("تمت إضافة " + product.name + " للسلة");
      }

      function addToCartWithOptions(selectedItem) {
        const cartKey = `${selectedItem.productId}|${selectedItem.size}|${selectedItem.color}`;
        const existing = cart.find((item) => item.cartKey === cartKey);

        if (existing) {
          existing.quantity = Math.min(
            99,
            existing.quantity + selectedItem.quantity,
          );
        } else {
          cart.push({
            cartKey,
            id: String(selectedItem.productId),
            productId: String(selectedItem.productId),
            name: selectedItem.name,
            price: Number(selectedItem.price) || 0,
            image: selectedItem.image,
            size: selectedItem.size,
            color: selectedItem.color,
            quantity: selectedItem.quantity,
          });
        }

        renderCart();
        showToast(
          `تمت إضافة ${selectedItem.name} للسلة (${selectedItem.size} - ${selectedItem.color})`,
        );
      }

      function changeQuantity(key, change) {
        const item = getCartItem(key);
        if (!item) return;

        item.quantity += change;
        if (item.quantity <= 0) {
          const index = cart.findIndex((row) => row.cartKey === item.cartKey);
          if (index >= 0) cart.splice(index, 1);
        } else {
          item.quantity = Math.min(99, item.quantity);
        }
        renderCart();
      }

      function removeCartItem(key) {
        const index = cart.findIndex(
          (item) => item.cartKey === String(key) || item.id === String(key),
        );
        if (index < 0) return;
        const removed = cart[index];
        cart.splice(index, 1);
        renderCart();
        showToast("تم حذف " + removed.name + " من السلة");
      }

      function renderCart() {
        updateCartCount();
        const empty = cart.length === 0;
        cartEmpty.style.display = empty ? "block" : "none";
        cartContent.style.display = empty ? "none" : "block";
        if (empty) {
          cartItemsElement.innerHTML = "";
          cartTotalElement.textContent = formatPrice(0);
          return;
        }

        cartItemsElement.innerHTML = cart
          .map(
            (item) => `
        <div class="cart-item">
            <img class="cart-item-image" src="${escapeHTML(item.image)}" alt="${escapeHTML(item.name)}"
                 onerror="this.onerror=null;this.src='https://placehold.co/150x150/101827/72b4ff?text=DANZO'">
            <div class="cart-item-info">
                <h6>${escapeHTML(item.name)}</h6>
                <div class="cart-item-price">${formatPrice(item.price * item.quantity)}</div>
                <small style="color:#8e99ad">سعر الوحدة: ${formatPrice(item.price)}</small>
                ${item.size || item.color ? `<small class="d-block mt-1" style="color:#9eacc2">المقاس: ${escapeHTML(item.size || "غير محدد")} | اللون: ${escapeHTML(item.color || "غير محدد")}</small>` : ""}
                <div class="quantity-control">
                    <button type="button" data-quantity-id="${escapeHTML(item.cartKey || item.id)}" data-change="-1" aria-label="تقليل الكمية">−</button>
                    <span>${item.quantity}</span>
                    <button type="button" data-quantity-id="${escapeHTML(item.cartKey || item.id)}" data-change="1" aria-label="زيادة الكمية">+</button>
                </div>
            </div>
            <button type="button" class="remove-cart-item" data-remove-id="${escapeHTML(item.cartKey || item.id)}" aria-label="حذف المنتج"><i class="fa-solid fa-trash-can"></i></button>
        </div>`,
          )
          .join("");
        cartTotalElement.textContent = formatPrice(getCartTotal());
      }

      /* أحداث أزرار المنتج والمفضلة والسلة */
      document.addEventListener("click", (event) => {
        const viewButton = event.target.closest("[data-view-product]");
        if (viewButton) {
          openProductDetails(viewButton.dataset.viewProduct);
          return;
        }

        const addButton = event.target.closest("[data-add-cart]");
        if (addButton) {
          addToCart(addButton.dataset.addCart);
          return;
        }

        const favoriteButton = event.target.closest("[data-favorite-id]");
        if (favoriteButton) {
          const id = favoriteButton.dataset.favoriteId;
          if (favorites.has(id)) {
            favorites.delete(id);
            showToast("تمت إزالة المنتج من المفضلة");
          } else {
            favorites.add(id);
            showToast("تمت إضافة المنتج للمفضلة");
          }
          renderProducts();
          renderFavorites();
          updateFavoriteButtons();
          return;
        }

        const removeFavorite = event.target.closest("[data-remove-favorite]");
        if (removeFavorite) {
          favorites.delete(removeFavorite.dataset.removeFavorite);
          renderFavorites();
          renderProducts();
          updateFavoriteButtons();
          showToast("تمت إزالة المنتج من المفضلة");
          return;
        }

        const quantityButton = event.target.closest("[data-quantity-id]");
        if (quantityButton) {
          changeQuantity(
            quantityButton.dataset.quantityId,
            Number(quantityButton.dataset.change),
          );
          return;
        }

        const removeButton = event.target.closest("[data-remove-id]");
        if (removeButton) removeCartItem(removeButton.dataset.removeId);
      });

      document.getElementById("cartBtn").addEventListener("click", () => {
        renderCart();
        cartModal.show();
      });
      document
        .getElementById("footerCartLink")
        .addEventListener("click", (event) => {
          event.preventDefault();
          renderCart();
          cartModal.show();
        });

      /* التحقق من رقم واتساب */
      function isValidStoreWhatsApp(number) {
        return /^20(10|11|12|15)\d{8}$/.test(number);
      }
      function normalizeEgyptianPhone(phone) {
        const arabicDigits = "٠١٢٣٤٥٦٧٨٩";
        let number = String(phone).replace(/[٠-٩]/g, (digit) =>
          String(arabicDigits.indexOf(digit)),
        );
        number = number.replace(/[^\d]/g, "");
        if (number.startsWith("0020")) number = number.slice(2);
        if (number.startsWith("0")) number = "20" + number.slice(1);
        return number;
      }

      /* إرسال الطلب */
      document
        .getElementById("checkoutForm")
        .addEventListener("submit", (event) => {
          event.preventDefault();
          if (!cart.length) {
            showToast("سلة التسوق فارغة حالياً");
            return;
          }

          const storeNumber = DANZO_WHATSAPP_NUMBER.replace(/\D/g, "");
          if (!isValidStoreWhatsApp(storeNumber)) {
            alert(
              "غيّر رقم DANZO_WHATSAPP_NUMBER إلى رقم واتساب مصري صحيح. مثال: 201012345678",
            );
            return;
          }

          const customerName = document
            .getElementById("customerName")
            .value.trim();
          const customerPhoneRaw = document
            .getElementById("customerPhone")
            .value.trim();
          const customerAddress = document
            .getElementById("customerAddress")
            .value.trim();
          const customerNotes = document
            .getElementById("customerNotes")
            .value.trim();
          if (!customerName || !customerPhoneRaw || !customerAddress) {
            showToast("من فضلك أكمل بيانات العميل المطلوبة");
            return;
          }

          const customerPhone = normalizeEgyptianPhone(customerPhoneRaw);
          if (!/^20(10|11|12|15)\d{8}$/.test(customerPhone)) {
            alert("من فضلك أدخل رقم هاتف مصري صحيح مثل 01012345678");
            return;
          }

          const orderNumber = "DZ-" + Date.now().toString().slice(-8);
          const productLines = cart.map((item, index) =>
            [
              `${index + 1}) ${item.name}`,
              `الكمية: ${item.quantity}`,
              `سعر الوحدة: ${formatPrice(item.price)}`,
              `إجمالي المنتج: ${formatPrice(item.price * item.quantity)}`,
            ].join("\n"),
          );

          const message = [
            "🛍️ *طلب جديد من DANZO*",
            "━━━━━━━━━━━━━━━━━━",
            `رقم الطلب: ${orderNumber}`,
            "",
            "*تفاصيل المنتجات:*",
            ...productLines,
            "",
            `*إجمالي الطلب: ${formatPrice(getCartTotal())}*`,
            "",
            "*بيانات العميل:*",
            `الاسم: ${customerName}`,
            `رقم الهاتف: ${customerPhoneRaw}`,
            `العنوان: ${customerAddress}`,
            ...(customerNotes ? [`ملاحظات: ${customerNotes}`] : []),
            "",
            "من فضلكم تأكيد توفر المنتجات وتفاصيل التوصيل.",
            "شكراً لاختياركم DANZO 💙",
          ].join("\n");

          const url =
            "https://wa.me/" +
            storeNumber +
            "?text=" +
            encodeURIComponent(message);
          const newWindow = window.open(url, "_blank");
          if (newWindow) newWindow.opener = null;
          else window.location.href = url;
        });

      /* Newsletter */
      document
        .getElementById("newsletterForm")
        .addEventListener("submit", (event) => {
          event.preventDefault();
          showToast(
            "شكراً لاهتمامك بـ DANZO! اربط النموذج بخدمة بريد لاستقبال الاشتراكات.",
          );
          event.target.reset();
        });

      /* واتساب الفوتر */
      function openStoreWhatsApp() {
        const number = DANZO_WHATSAPP_NUMBER.replace(/\D/g, "");
        if (!isValidStoreWhatsApp(number)) {
          alert("من فضلك أضف رقم واتساب المتجر الصحيح داخل الكود.");
          return;
        }
        window.open(
          "https://wa.me/" +
            number +
            "?text=" +
            encodeURIComponent("مرحباً، أريد الاستفسار عن منتجات DANZO."),
          "_blank",
          "noopener,noreferrer",
        );
      }
      ["footerWhatsapp", "footerWhatsappText"].forEach((id) => {
        const element = document.getElementById(id);
        element.addEventListener("click", (event) => {
          event.preventDefault();
          openStoreWhatsApp();
        });
      });

      /* إغلاق قائمة الموبايل بعد الضغط على رابط */
      document.querySelectorAll(".navbar .nav-link").forEach((link) => {
        link.addEventListener("click", () => {
          const navbar = document.getElementById("mainNavbar");
          if (navbar.classList.contains("show"))
            bootstrap.Collapse.getOrCreateInstance(navbar).hide();
        });
      });

      /* تشغيل أولي */
      renderCategories();
      renderFilters();
      renderProducts();
      renderFavorites();
      renderCart();
