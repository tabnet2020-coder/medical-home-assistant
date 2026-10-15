import type { ActiveIngredient, Medicine, LabReference } from '../types.ts';

export const activeIngredientsList: ActiveIngredient[] = [
  {
    id: 'paracetamol',
    nameEn: 'Paracetamol (Acetaminophen)',
    nameAr: 'باراسيتامول (أسيتامينوفين)',
    drugClass: 'مسكن للآلام وخافض للحرارة (Analgesic & Antipyretic)',
    indications: [
      'تخفيف الآلام الخفيفة إلى المتوسطة مثل الصداع وآلام الأسنان',
      'تخفيف آلام العضلات والمفاصل وآلام الظهر',
      'خفض درجة حرارة الجسم والحمى المصاحبة لنزلات البرد والإنفلونزا',
      'آلام الدورة الشهرية'
    ],
    sideEffects: [
      'غثيان خفيف أو اضطراب بسيط في المعدة (نادر جداً عند الالتزام بالجرعة)',
      'طفح جلدي تحسسي (نادر)'
    ],
    severeSideEffects: [
      'تسمم كبدي حاد في حال تجاوز الجرعة القصوى (أكثر من 4 جرام يومياً للبالغين)',
      'اصفرار العينين أو الجلد (اليرقان)',
      'صعوبة في التنفس أو تورم الوجه واللسان'
    ],
    warnings: [
      'تجنب تناول أي أدوية أخرى تحتوي على باراسيتامول في نفس الوقت لمنع التسمم الدوائي',
      'يمنع تناوله بجرعات عالية لمرضى القصور الكبدي الشديد أو مدمني الكحول',
      'الجرعة القصوى للشخص البالغ هي 4000 مجم (4 جرام) خلال 24 ساعة، بفاصل لا يقل عن 4-6 ساعات بين الجرعات',
      'استشر الطبيب إذا استمرت الحمى أكثر من 3 أيام أو استمر الألم أكثر من 5 أيام'
    ],
    safeUsageAdvice: 'تناول القرص مع كوب كامل من الماء، يمكن تناوله مع أو بدون الطعام، ويفضل مع الطعام للمعدة الحساسة.'
  },
  {
    id: 'amoxicillin_clavulanate',
    nameEn: 'Amoxicillin + Clavulanic Acid',
    nameAr: 'أموكسيسيلين + حمض الكلافولانيك',
    drugClass: 'مضاد حيوي واسع المجال (Penicillin-class Antibiotic with Beta-lactamase inhibitor)',
    indications: [
      'علاج عدوى الجهاز التنفسي العلوي والسفلي (التهاب اللوزتين، الجيوب الأنفية، الشعب الهوائية)',
      'التهابات الأذن الوسطى الحادة',
      'عدوى المسالك البولية والتناسلية',
      'التهابات الجلد والأنسجة الرخوة وعدوى الأسنان'
    ],
    sideEffects: [
      'إسهال أو اضطرابات هضمية خفيفة',
      'غثيان ورغبة في القيء',
      'نمو فطريات في الفم أو المهبل (داء المبيضات)'
    ],
    severeSideEffects: [
      'حساسية مفرطة من البنسلين (طفح شديد، ضيق تنفس، صدمة تحسسية)',
      'إسهال مائي شديد مستمر مصحوب بمغص (التهاب القولون الغشائي الكاذب)',
      'التهاب الكبد أو اليرقان الركودي'
    ],
    warnings: [
      'ممنوع منعاً باتاً لأي شخص لديه تاريخ سابق من حساسية البنسلين أو السيفالوسبورين',
      'يجب إكمال الكورس العلاجي بالكامل وفق وصفة الطبيب حتى لو اختفت الأعراض لمنع مقاومة البكتيريا',
      'يجب حفظ الشراب المعلق بعد حله في الثلاجة واستخدامه خلال 7 إلى 10 أيام فقط ثم التخلص منه'
    ],
    safeUsageAdvice: 'يفضل تناوله في بداية الوجبة لتقليل اضطرابات الجهاز الهضمي وتحسين امتصاص الدواء.'
  },
  {
    id: 'ibuprofen',
    nameEn: 'Ibuprofen',
    nameAr: 'إيبوبروفين',
    drugClass: 'مضاد التهاب غير ستيرويدي ومسكن (NSAID)',
    indications: [
      'تسكين الآلام المتوسطة والحادة مثل آلام الأسنان والروماتيزم',
      'علاج التهاب المفاصل والعضلات والتورم',
      'خفض الحرارة في حالات الحمى الشديدة',
      'علاج عسر الطمث وآلام الدورة الشهرية'
    ],
    sideEffects: [
      'حرقة في المعدة وعسر هضم',
      'غثيان أو ألم خفيف في البطن',
      'دوار خفيف أو صداع'
    ],
    severeSideEffects: [
      'قرحة ونزيف في المعدة أو الأمعاء (براز أسود قطراني أو قيء دموي)',
      'قصور كلوي حاد مع انحباس السوائل وتورم القدمين',
      'زيادة خطر الجلطات القلبية والسكتات الدماغية عند الاستخدام المطول بجرعات عالية'
    ],
    warnings: [
      'يحظر استخدامه لمرضى قرحة المعدة النشطة أو النزيف المعوي',
      'يحذر استخدامه لمرضى القصور الكلوي، قصور القلب الاحتقاني، أو ارتفاع ضغط الدم غير المنضبط',
      'يمنع استخدامه في الأشهر الأخيرة من الحمل (الثلث الثالث) لتأثيره على قلب الجنين'
    ],
    safeUsageAdvice: 'يجب تناوله دائماً بعد تناول الطعام أو مع كوب حليب لحماية جدار المعدة من التهيج.'
  },
  {
    id: 'metformin',
    nameEn: 'Metformin Hydrochloride',
    nameAr: 'ميتفورمين هيدروكلوريد',
    drugClass: 'خافض لسكر الدم - فئة البيجوانيد (Biguanide Antidiabetic)',
    indications: [
      'علاج داء السكري من النوع الثاني لتحسين استجابة الجسم للأنسولين وخفض إنتاج الجلوكوز من الكبد',
      'علاج متلازمة تكيس المبايض (PCOS) لدى النساء لتحسين التبويض',
      'الوقاية من تطور السكري لدى الأشخاص في مرحلة ما قبل السكري (Prediabetes)'
    ],
    sideEffects: [
      'اضطرابات في المعدة، طعم معدني في الفم، انتفاخ وغازات في الأسابيع الأولى',
      'إسهال خفيف أو ليونة في البراز تتلاشى تدريجياً',
      'نقص امتصاص فيتامين ب12 مع الاستخدام الطويل'
    ],
    severeSideEffects: [
      'الحماض اللبني (Lactic Acidosis) - حالة نادرة وخطيرة تظهر بوهن شديد، صعوبة تنفس، وألم بطني حاد'
    ],
    warnings: [
      'يمنع استخدامه لمرضى القصور الكلوي المتقدم (eGFR أقل من 30 مل/دقيقة)',
      'يجب إيقاف الدواء مؤقتاً قبل 48 ساعة من إجراء الفحوصات الإشعاعية بالصبغة الوريدية',
      'لا يسبب هبوط السكر بمفرده، لكن قد يسببه إذا تم دمجه مع أدوية سكر أخرى كالسلفونيل يوريا'
    ],
    safeUsageAdvice: 'تناول الدواء مع الوجبة الرئيسية في نفس الموعد يومياً، وابتلع القرص كامل دون سحق إذا كان ممتد المفعول (XR).'
  },
  {
    id: 'atorvastatin',
    nameEn: 'Atorvastatin',
    nameAr: 'أتورفاستاتين',
    drugClass: 'خافض للكوليسترول والدهون - فئة الستاتين (HMG-CoA Reductase Inhibitor)',
    indications: [
      'خفض مستويات الكوليسترول الكلي والكوليسترول الضار (LDL) والدهون الثلاثية',
      'رفع مستوى الكوليسترول الحميد النافع (HDL)',
      'الوقاية الأولية والثانوية من النوبات القلبية والسكتات الدماغية وتصلب الشرايين'
    ],
    sideEffects: [
      'آلام أو وهن خفيف في العضلات والمفاصل',
      'صداع خفيف أو اضطراب هضمي بسيط',
      'ارتفاع طفيف مؤقت في إنزيمات الكبد'
    ],
    severeSideEffects: [
      'انحلال الربيدات (Rhabdomyolysis) - تكسر خطير في أنسجة العضلات مصحوب ببول بلون الشاي الداكن',
      'ألم عضلي حاد غير مبرر مصحوب بحمى ووهن شديد'
    ],
    warnings: [
      'يمنع منعاً باتاً أثناء فترة الحمل والرضاعة لاحتمال تشوه الجنين',
      'يمنع تناوله مع عصير الجريب فروت بكميات كبيرة لأنه يزيد من تركيز الدواء في الدم بشكل خطير',
      'يجب إجراء فحص وظائف الكبد (ALT, AST) قبل بدء العلاج ودورياً حسب تعليمات الطبيب'
    ],
    safeUsageAdvice: 'يفضل تناول القرص مساءً قبل النوم مع أو بدون طعام، في نفس التوقيت يومياً.'
  },
  {
    id: 'omeprazole',
    nameEn: 'Omeprazole',
    nameAr: 'أوميبرازول',
    drugClass: 'مثبط مضخة البروتون لمعدل إفراز الحمض (Proton Pump Inhibitor - PPI)',
    indications: [
      'علاج الارتجاع المريئي وحرقة المعدة (حموضة المعدة المزمنة)',
      'علاج قرحة المعدة والاثني عشر',
      'استئصال جرثومة المعدة الحلزونية (H. Pylori) ضمن البروتوكول الثلاثي',
      'حماية المعدة من التآكل الناتج عن استخدام المسكنات القوية (NSAIDs)'
    ],
    sideEffects: [
      'صداع خفيف',
      'إمساك أو إسهال بسيط',
      'انتفاخ وغازات في البطن'
    ],
    severeSideEffects: [
      'نقص المغنيسيوم أو فيتامين ب12 عند الاستخدام لسنوات متواصلة',
      'زيادة طفيفة في احتمالية كسور العظام مع الاستخدام المطول بجرعات عالية',
      'عدوى بكتيريا المطثية العسيرة (C. Difficile) المعوية'
    ],
    warnings: [
      'يجب ابتلاع الكبسولة كاملة بالماء دون كسرها أو مضغ الحبيبات الداخلية',
      'لا ينصح باستخدامه لفترات تتجاوز 14 يوماً لعلاج الحموضة العادية دون استشارة طبية'
    ],
    safeUsageAdvice: 'تناول الكبسولة على معدة فارغة صباحاً قبل الإفطار بنصف ساعة إلى ساعة لتحقيق أفضل فعالية تثبيط للحمض.'
  },
  {
    id: 'cetirizine',
    nameEn: 'Cetirizine Hydrochloride',
    nameAr: 'سيتريزين هيدروكلوريد',
    drugClass: 'مضاد للحساسية والهيستامين من الجيل الثاني (Second-generation Antihistamine)',
    indications: [
      'تخفيف أعراض حمى القش وحساسية الأنف الموسمية (العطس، الرشح، الحكة وسيلان العينين)',
      'علاج الشرى الجلدي (الارتكاريا) والحكة المزمنة',
      'التهاب الملتحمة التحسسي للعين'
    ],
    sideEffects: [
      'نعاس خفيف لدى بعض الأشخاص (أقل بكثير من مضادات الجيل الأول)',
      'جفاف خفيف في الفم أو الحلق',
      'صداع أو تعب بسيط'
    ],
    severeSideEffects: [
      'رد فعل تحسسي شديد (نادر جداً)',
      'احتباس البول أو تسارع خفقان القلب'
    ],
    warnings: [
      'توخ الحذر عند قيادة السيارة أو تشغيل الآلات حتى تتأكد من مدى تأثير الدواء على يقظتك',
      'تجنب تناول المهدئات أو الكحوليات تزامناً معه لزيادة تأثير النعاس',
      'يجب تقليل الجرعة لمرضى الفشل الكلوي'
    ],
    safeUsageAdvice: 'يؤخذ قرص واحد يومياً (10 مجم)، ويفضل تناوله مساءً قبل النوم لتجنب أي شعور محتمل بالنعاس أثناء النهار.'
  },
  {
    id: 'diclofenac_potassium',
    nameEn: 'Diclofenac Potassium',
    nameAr: 'ديكلوفيناك البوتاسيوم',
    drugClass: 'مضاد التهاب ومسكن سريع المفعول (Rapid NSAID)',
    indications: [
      'تسكين آلام الأسنان الحادة بعد الخلع أو العمليات',
      'تخفيف نوبات الصداع النصفي الحادة',
      'آلام الروماتيزم، التواء المفاصل، والإصابات الرياضية',
      'آلام الطمث الحادة'
    ],
    sideEffects: [
      'ألم في المعدة وحرقة هضمية',
      'غثيان وانتفاخ',
      'دوار بسيط'
    ],
    severeSideEffects: [
      'نزيف وقرحة معوية معدية',
      'ارتفاع ضغط الدم والقصور الكلوي',
      'خطر التخثر القلبي الوعائي'
    ],
    warnings: [
      'لا ينصح به لمرضى القلب وأمراض الشرايين التاجية',
      'ممنوع لمرضى قرحة المعدة والقصور الكبدي والكلوي الحاد',
      'يستخدم لأقصر فترة ممكنة وبأقل جرعة فعالة'
    ],
    safeUsageAdvice: 'تناول القرص بعد الأكل مباشرة مع كوب ماء، ولا تستلقي لمدة 10 دقائق بعد تناوله.'
  },
  {
    id: 'azithromycin',
    nameEn: 'Azithromycin',
    nameAr: 'أزيثرومايسين',
    drugClass: 'مضاد حيوي من فئة الماكروليد (Macrolide Antibiotic)',
    indications: [
      'التهابات الجهاز التنفسي والجيوب الأنفية والبلعوم والشعب الهوائية',
      'الالتهاب الرئوي المكتسب من المجتمع',
      'التهابات الجلد غير المعقدة',
      'العدوى المنقولة جنسياً مثل الكلاميديا'
    ],
    sideEffects: [
      'إسهال خفيف أو ألم بالبطن',
      'غثيان وتغير مؤقت في حاسة التذوق'
    ],
    severeSideEffects: [
      'اضطراب في كهربية القلب واستطالة فترة QT (خفقان وتسارع ضربات القلب)',
      'التهاب الكبد الحاد',
      'إسهال حاد مائي'
    ],
    warnings: [
      'يجب الحذر لمرضى اضطرابات كهربية القلب أو من يتناولون أدوية تؤثر على نظم القلب',
      'يؤخذ مرة واحدة يومياً بنفس التوقيت لمدة تتراوح بين 3 إلى 5 أيام غالباً حسب الوصفة',
      'لا يستخدم لنزلات البرد الفيروسية إطلاقاً'
    ],
    safeUsageAdvice: 'يمكن تناوله مع أو بدون الطعام، ولكن تناوله مع الطعام يقلل الشعور بالغثيان.'
  },
  {
    id: 'bisoprolol',
    nameEn: 'Bisoprolol Fumarate',
    nameAr: 'بيسوبرولول فومارات',
    drugClass: 'حاصر مستقبلات بيتا الانتقائي للقلب (Selective Beta-1 Blocker)',
    indications: [
      'علاج ارتفاع ضغط الدم الشرياني',
      'علاج الذبحة الصدرية المزمنة وأمراض شرايين القلب',
      'علاج قصور القلب المزمن المستقر بجانب الأدوية الأخرى',
      'تنظيم ضربات القلب المتسارعة'
    ],
    sideEffects: [
      'بطء نبضات القلب (Bradycardia)',
      'الشعور بالبرودة في أطراف اليدين والقدمين',
      'تعب وإرهاق عام وخمول في أول فترة من العلاج',
      'دوار عند الوقوف المفاجئ'
    ],
    severeSideEffects: [
      'هبوط شديد في النبض (أقل من 50 نبضة بالدقيقة)',
      'ضيق تنفس حاد وتفاقم أزمة الربو',
      'تورم القدمين وتفاقم احتباس السوائل'
    ],
    warnings: [
      'ممنوع منعاً باتاً إيقاف الدواء فجأة دون استشارة الطبيب لأنه قد يسبب نوبة قلبية أو ارتفاع خطير ومفاجئ في الضغط',
      'ممنوع لمرضى الربو القصبي الشديد ومرضى بطء القلب الحاد والإحصار الأذيني البطيني'
    ],
    safeUsageAdvice: 'يؤخذ صباحاً بانتظام مع قليل من الماء مع أو بدون إفطار، ويجب قياس النبض وضغط الدم دورياً.'
  },
  {
    id: 'tadalafil',
    nameEn: 'Tadalafil',
    nameAr: 'تادالافيل',
    drugClass: 'مثبط إنزيم فوسفو داي إستريز 5 (PDE5 Inhibitor)',
    indications: [
      'علاج ضعف الانتصاب لدى الرجال البالغين',
      'تخفيف أعراض تضخم البروستاتا الحميد (BPH)',
      'علاج ارتفاع ضغط الدم الشرياني الرئوي (بجرعات مخصصة)'
    ],
    sideEffects: [
      'صداع واحمرار الوجه وسخونة الأطراف',
      'عسر هضم واضطراب في المعدة',
      'ألم في عضلات الظهر والساقين',
      'احتقان وانسداد الأنف'
    ],
    severeSideEffects: [
      'انخفاض حاد وخطير في ضغط الدم في حال تناوله مع أدوية النيترات الموسعة للشرايين',
      'انتصاب مستمر ومؤلم لأكثر من 4 ساعات (قساح / Priapism) يستدعي الطوارئ فوراً',
      'فقدان مفاجئ في الرؤية أو السمع (نادر جداً)'
    ],
    warnings: [
      'ممنوع منعاً باتاً لمرضى القلب الذين يتناولون أدوية النيتروجليسرين أو مشتقات النيترات (قد يسبب هبوطاً قاتلاً في الضغط)',
      'يمنع تناوله لمن أصيبوا مؤخراً بجلطة قلبية أو سكتة دماغية أو قصور قلبي غير مستقر',
      'لا تتناول أكثر من قرص واحد خلال 24 ساعة',
      'يحذر الجمع بينه وبين أدوية حاصرات ألفا دون استشارة وتعديل الجرعة من قبل الطبيب'
    ],
    safeUsageAdvice: 'يؤخذ القرص عن طريق الفم قبل النشاط بحوالي 30 دقيقة على الأقل، مع كوب ماء، ولا يتأثر تناوله بالطعام.'
  },
  {
    id: 'nosifol_complex',
    nameEn: 'Inositol + Folic Acid + Zinc + Betaine + Vitamin B6 + Vitamin B12',
    nameAr: 'إينوزيتول + حمض الفوليك + زنك + بيتين + فيتامين ب6 وفيتامين ب12',
    drugClass: 'مكمل غذائي علاجي لدعم الخصوبة وتكيس المبايض (PCOS & Fertility Support Supplement)',
    indications: [
      'تحسين الخصوبة وزيادة فرص الحمل الطبيعي وأطفال الأنابيب',
      'علاج متلازمة تكيس المبايض (PCOS) وتنظيم الدورة الشهرية',
      'تنظيم الهرمونات ودعم صحة وجودة البويضات والمبيضين',
      'تحسين حساسية الخلايا للأنسولين وخفض مستويات الأندروجينات (الهرمونات الذكورية)',
      'تقليل تساقط الشعر وحب الشباب المصاحبين لاضطراب الهرمونات وتكيس المبايض'
    ],
    sideEffects: [
      'اضطراب هضمي خفيف أو غازات نادرة عند بدء الاستخدام',
      'غثيان خفيف يزول بتناول المستحضر بعد وجبة طعام'
    ],
    severeSideEffects: [
      'رد فعل تحسسي نادر جداً لأحد الفيتامينات أو المعادن (طفح جلدي أو حكة)'
    ],
    warnings: [
      'مكمل غذائي علاجي يؤخذ لدعم الخصوبة وتكيس المبايض ولا يغني عن المتابعة مع أخصائي النساء والولادة',
      'احرصي على حل المسحوق جيداً في كمية ماء كافية وشربه طازجاً',
      'يحفظ في مكان بارد وجاف تحت 25 درجة مئوية بعيداً عن الرطوبة والشمس المباشرة'
    ],
    safeUsageAdvice: 'يذاب كيس واحد (Sachet) في نصف كوب ماء (حوالي 100 إلى 150 مل) ويقلب جيداً حتى يذوب تماماً ويشرب فوراً، مرة واحدة يومياً بعد وجبة الطعام، أو حسب إرشادات الطبيب أو الصيدلي المكتوبة على العلبة.'
  }
];

export const medicinesList: Medicine[] = [
  // NosiFol & Fertility / PCOS Supplements (Sakura Italia)
  {
    id: 'nosifol_sakura',
    tradeNameAr: 'نوسيفول',
    tradeNameEn: 'NosiFol',
    activeIngredientId: 'nosifol_complex',
    strength: '30 كيس بوزن 5.5 جم (30 Sachets of 5.5g)',
    dosageForm: 'أكياس بودرة للحل في الماء (Oral Sachets)',
    manufacturer: 'ساكورا إيطاليا (Sakura Italia)',
    prescriptionRequired: false,
    barcode: '803383701234',
    descriptionAr: 'مستحضر علاجي متكامل من إنتاج شركة ساكورا إيطاليا (Sakura Italia) بتركيبة متطورة تجمع الإينوزيتول وحمض الفوليك والزنك والبيتين وفيتامينات B6 و B12. مخصص لعلاج متلازمة تكيس المبايض (PCOS) وتحسين الخصوبة وجودة البويضات وتنظيم الدورة الشهرية.',
    notes: 'طريقة الاستخدام: يذاب كيس واحد في نصف كوب ماء مرة واحدة يومياً، أو حسب تعليمات الطبيب أو الصيدلي المكتوبة بخط اليد على العلبة.'
  },
  {
    id: 'nosifol_d_sakura',
    tradeNameAr: 'نوسيفول دي',
    tradeNameEn: 'NosiFol-D',
    activeIngredientId: 'nosifol_complex',
    strength: '30 كيس فوار مع فيتامين د (30 Sachets)',
    dosageForm: 'أكياس فوارة للحل في الماء (Oral Sachets)',
    manufacturer: 'ساكورا إيطاليا (Sakura Italia)',
    prescriptionRequired: false,
    barcode: '803383701235',
    descriptionAr: 'النسخة المعززة بفيتامين د3 من مستحضر نوسيفول لدعم التبويض وعلاج متلازمة تكيس المبايض وتعزيز الخصوبة.',
    notes: 'بديل مباشر مطابق من نفس الشركة المصنعة ساكورا إيطاليا.'
  },
  {
    id: 'inofolic_plus',
    tradeNameAr: 'إينوفوليك',
    tradeNameEn: 'Inofolic',
    activeIngredientId: 'nosifol_complex',
    strength: 'ميو-إينوزيتول 2000 مجم + حمض الفوليك 200 مكجم',
    dosageForm: 'أكياس للحل في الماء (Oral Sachets)',
    manufacturer: 'شركة لوفارما (Lo.Li. Pharma - Italy)',
    prescriptionRequired: false,
    barcode: '803271537001',
    descriptionAr: 'بديل علاجي إيطالي معتمد يحتوي على الإينوزيتول والفوليك أسيد لعلاج تكيس المبايض وتحسين التبويض ودعم الخصوبة.',
    notes: 'بديل مكافئ شائع في الصيدليات العربية والليبية.'
  },

  // Tadalafil (Tyra / Cialis)
  {
    id: 'tyra_20',
    tradeNameAr: 'تايرا 20 مجم',
    tradeNameEn: 'Tyra 20mg',
    activeIngredientId: 'tadalafil',
    strength: '20 مجم',
    dosageForm: 'أقراص مغلفة (Film Coated Tablets)',
    manufacturer: 'دار الدواء (Dar Al Dawa - DAD)',
    prescriptionRequired: true,
    barcode: '625100123001',
    descriptionAr: 'دواء تادالافيل 20 ملغ من إنتاج دار الدواء (Dar Aldawa)، يستخدم لعلاج ضعف الانتصاب وتضخم البروستاتا تحت إشراف طبي.',
    notes: 'تحذير: لا يؤخذ مع أدوية النترات الموسعة لشرايين القلب.'
  },
  {
    id: 'cialis_20',
    tradeNameAr: 'سياليس 20 مجم',
    tradeNameEn: 'Cialis 20mg',
    activeIngredientId: 'tadalafil',
    strength: '20 مجم',
    dosageForm: 'أقراص مغلفة (Film Coated Tablets)',
    manufacturer: 'شركة إيلي ليلي (Eli Lilly)',
    prescriptionRequired: true,
    barcode: '625100123002',
    descriptionAr: 'المستحضر المبتكر الأصلي لمادة تادالافيل 20 مجم لعلاج ضعف الانتصاب ممتد المفعول.',
    notes: 'البديل العالمي المعتمد.'
  },

  // Paracetamol
  {
    id: 'panadol_extra',
    tradeNameAr: 'بانادول إكسترا',
    tradeNameEn: 'Panadol Extra',
    activeIngredientId: 'paracetamol',
    strength: '500 مجم باراسيتامول + 65 مجم كافيين',
    dosageForm: 'أقراص مغلفة',
    manufacturer: 'جلاكسو سميث كلاين (GSK)',
    prescriptionRequired: false,
    barcode: '622112345001',
    descriptionAr: 'مسكن قوي وخافض للحرارة معزز بالكافيين لتسريع الامتصاص، مناسب للصداع النصفي وآلام الأسنان.',
    notes: 'يحتوي على كافيين لذا يفضل تجنبه ليلاً لمنع الأرق.'
  },
  {
    id: 'panadol_advance',
    tradeNameAr: 'بانادول أدفانس',
    tradeNameEn: 'Panadol Advance',
    activeIngredientId: 'paracetamol',
    strength: '500 مجم',
    dosageForm: 'أقراص بتقنية أوبتيزورب (Optizorb)',
    manufacturer: 'جلاكسو سميث كلاين (GSK)',
    prescriptionRequired: false,
    barcode: '622112345002',
    descriptionAr: 'باراسيتامول نقي خفيف على المعدة سريع التحلل، خافض للحرارة ومسكن للصداع وآلام الجسم.',
    notes: 'آمن للمعدة والنساء الحوامل تحت إشراف طبي.'
  },
  {
    id: 'adol_500',
    tradeNameAr: 'أدول 500',
    tradeNameEn: 'Adol 500mg',
    activeIngredientId: 'paracetamol',
    strength: '500 مجم',
    dosageForm: 'أقراص / شراب / تحاميل',
    manufacturer: 'شركة جولفا للأدوية (Julphar)',
    prescriptionRequired: false,
    barcode: '622112345003',
    descriptionAr: 'بديل تجاري ممتاز للبانادول بنفس المادة الفعالة ونفس الفعالية العلاجية لتخفيف الآلام وخفض الحرارة.',
    notes: 'بديل اقتصادي مطابق تماماً.'
  },
  {
    id: 'abimol_500',
    tradeNameAr: 'أبيمول 500',
    tradeNameEn: 'Abimol 500mg',
    activeIngredientId: 'paracetamol',
    strength: '500 مجم',
    dosageForm: 'أقراص / شراب للأطفال',
    manufacturer: 'شركة جلاكسو للصناعات الدوائية / جلاكسو مصر',
    prescriptionRequired: false,
    barcode: '622112345004',
    descriptionAr: 'بديل باراسيتامول محلي واسع الانتشار خافض للحرارة ومسكن للأوجاع العامة.',
    notes: 'بديل وطني مكافئ.'
  },
  {
    id: 'cetal_500',
    tradeNameAr: 'سيتال 500',
    tradeNameEn: 'Cetal 500mg',
    activeIngredientId: 'paracetamol',
    strength: '500 مجم',
    dosageForm: 'أقراص / شراب / نقط',
    manufacturer: 'شركة إيبيكو (EIPICO)',
    prescriptionRequired: false,
    barcode: '622112345005',
    descriptionAr: 'دواء باراسيتامول متوفر على نطاق واسع لعلاج الصداع ونزلات البرد.',
    notes: 'بديل تجاري مباشر.'
  },

  // Amoxicillin + Clavulanic Acid
  {
    id: 'augmentin_1g',
    tradeNameAr: 'أوجمنتين 1 جم',
    tradeNameEn: 'Augmentin 1g',
    activeIngredientId: 'amoxicillin_clavulanate',
    strength: '1000 مجم (875 أموكسيسيلين + 125 كلافولانيك)',
    dosageForm: 'أقراص مغلفة',
    manufacturer: 'جلاكسو سميث كلاين (GSK)',
    prescriptionRequired: true,
    barcode: '622112345010',
    descriptionAr: 'مضاد حيوي واسع المدى معروف لعلاج التهابات الجهاز التنفسي والجيوب والأذن والمسالك.',
    notes: 'يؤخذ كل 12 ساعة مع الأكل.'
  },
  {
    id: 'curam_1g',
    tradeNameAr: 'كيورام 1 جم',
    tradeNameEn: 'Curam 1g',
    activeIngredientId: 'amoxicillin_clavulanate',
    strength: '1000 مجم (875 + 125)',
    dosageForm: 'أقراص مغلفة قابلة للبلع',
    manufacturer: 'شركة ساندوز العالمية (Sandoz / Novartis)',
    prescriptionRequired: true,
    barcode: '622112345011',
    descriptionAr: 'بديل تجاري عالمي مباشر للأوجمنتين يحتوي على نفس التركيبة بالضبط بنفس الكفاءة.',
    notes: 'بديل معتمد ومكافئ حيوياً بنسبة 100% للأوجمنتين.'
  },
  {
    id: 'megamox_1g',
    tradeNameAr: 'ميجاموكس 1 جم',
    tradeNameEn: 'Megamox 1g',
    activeIngredientId: 'amoxicillin_clavulanate',
    strength: '1000 مجم',
    dosageForm: 'أقراص مغلفة',
    manufacturer: 'شركة الجزيرة للصناعات الدوائية (Hikma / SPIMACO)',
    prescriptionRequired: true,
    barcode: '622112345012',
    descriptionAr: 'بديل إقليمي عالي الجودة للأوجمنتين لعلاج العدوى البكتيرية الشديدة والمتوسطة.',
    notes: 'بديل موثوق ومتاح بالصيدليات.'
  },
  {
    id: 'hibiotic_1g',
    tradeNameAr: 'هاي بيوتك 1 جم',
    tradeNameEn: 'Hibiotic 1g',
    activeIngredientId: 'amoxicillin_clavulanate',
    strength: '1000 مجم',
    dosageForm: 'أقراص',
    manufacturer: 'شركة أمون للأدوية (Amoun)',
    prescriptionRequired: true,
    barcode: '622112345013',
    descriptionAr: 'بديل تجاري محلي شهير للأوجمنتين بنفس المادة الفعالة ونفس الفعالية الحيوية.',
    notes: 'بديل اقتصادي واسع الانتشار.'
  },

  // Ibuprofen
  {
    id: 'brufen_400',
    tradeNameAr: 'بروفين 400 مجم',
    tradeNameEn: 'Brufen 400mg',
    activeIngredientId: 'ibuprofen',
    strength: '400 مجم',
    dosageForm: 'أقراص مغلفة',
    manufacturer: 'أبوت (Abbott) / فياتريس',
    prescriptionRequired: false,
    barcode: '622112345020',
    descriptionAr: 'مسكن آلام ومضاد للالتهابات الروماتيزمية وتورم المفاصل وخافض فعال للحرارة.',
    notes: 'يؤخذ بعد الأكل مباشرة.'
  },
  {
    id: 'advil_200',
    tradeNameAr: 'أدفيل 200 مجم',
    tradeNameEn: 'Advil 200mg',
    activeIngredientId: 'ibuprofen',
    strength: '200 مجم',
    dosageForm: 'كبسولات جيلاتينية رخوة سائلة (Liqui-Gels)',
    manufacturer: 'فايزر / هاليون (Haleon)',
    prescriptionRequired: false,
    barcode: '622112345021',
    descriptionAr: 'كبسولات إيبوبروفين سريعة الامتصاص لآلام الصداع الشديد والأسنان والظهر.',
    notes: 'سريع المفعول ويجب تناوله بعد الطعام.'
  },
  {
    id: 'marcofen_400',
    tradeNameAr: 'ماركوفين 400 مجم',
    tradeNameEn: 'Marcofen 400mg',
    activeIngredientId: 'ibuprofen',
    strength: '400 مجم',
    dosageForm: 'أقراص مغلفة',
    manufacturer: 'شركة ماركيرل (Marcyrl)',
    prescriptionRequired: false,
    barcode: '622112345022',
    descriptionAr: 'بديل تجاري مطابق للبروفين لعلاج آلام العظام والأسنان وخفض الحرارة.',
    notes: 'بديل اقتصادي فعال.'
  },

  // Metformin
  {
    id: 'glucophage_1000',
    tradeNameAr: 'جلوكوفاج 1000 مجم',
    tradeNameEn: 'Glucophage 1000mg',
    activeIngredientId: 'metformin',
    strength: '1000 مجم',
    dosageForm: 'أقراص مغلفة',
    manufacturer: 'شركة ميرك (Merck Serono)',
    prescriptionRequired: true,
    barcode: '622112345030',
    descriptionAr: 'الدواء المرجعي العالمي الأول لمرضى السكري من النوع الثاني وتحسين حساسية الإنسولين.',
    notes: 'يؤخذ مع وجبة الطعام.'
  },
  {
    id: 'glucophage_xr_500',
    tradeNameAr: 'جلوكوفاج إكس آر 500',
    tradeNameEn: 'Glucophage XR 500mg',
    activeIngredientId: 'metformin',
    strength: '500 مجم ممتد المفعول',
    dosageForm: 'أقراص ممتدة المفعول',
    manufacturer: 'شركة ميرك (Merck)',
    prescriptionRequired: true,
    barcode: '622112345031',
    descriptionAr: 'تركيبة ممتدة المفعول تطلق الدواء ببطء وتقلل الاضطرابات المعوية المعتادة.',
    notes: 'لا تكسر القرص.'
  },
  {
    id: 'cidophage_850',
    tradeNameAr: 'سيدوفاج 850 مجم',
    tradeNameEn: 'Cidophage 850mg',
    activeIngredientId: 'metformin',
    strength: '850 مجم',
    dosageForm: 'أقراص',
    manufacturer: 'شركة تنمية الصناعات الكيماوية (سيد - CID)',
    prescriptionRequired: true,
    barcode: '622112345032',
    descriptionAr: 'بديل محلي شهير جداً للجلوكوفاج لتنظيم سكر الدم وعلاج تكيس المبايض.',
    notes: 'بديل مباشر مطابق علمياً.'
  },

  // Atorvastatin
  {
    id: 'lipitor_20',
    tradeNameAr: 'ليبيتور 20 مجم',
    tradeNameEn: 'Lipitor 20mg',
    activeIngredientId: 'atorvastatin',
    strength: '20 مجم',
    dosageForm: 'أقراص مغلفة',
    manufacturer: 'فايزر / فياتريس (Pfizer / Viatris)',
    prescriptionRequired: true,
    barcode: '622112345040',
    descriptionAr: 'الدواء الأشهر عالمياً لخفض الكوليسترول الضار والوقاية من تصلب الشرايين والجلطات.',
    notes: 'يؤخذ ليلاً.'
  },
  {
    id: 'ator_20',
    tradeNameAr: 'آتور 20 مجم',
    tradeNameEn: 'Ator 20mg',
    activeIngredientId: 'atorvastatin',
    strength: '20 مجم',
    dosageForm: 'أقراص مغلفة',
    manufacturer: 'شركة إيبيكو (EIPICO)',
    prescriptionRequired: true,
    barcode: '622112345041',
    descriptionAr: 'بديل معتمد ومطابق تماماً لليبيتور بنفس الجرعة لخفض كوليسترول الدم والدهون الثلاثية.',
    notes: 'بديل وطني مكافئ عالي الفعالية.'
  },
  {
    id: 'lipona_20',
    tradeNameAr: 'ليبونا 20 مجم',
    tradeNameEn: 'Lipona 20mg',
    activeIngredientId: 'atorvastatin',
    strength: '20 مجم',
    dosageForm: 'أقراص مغلفة',
    manufacturer: 'شركة الفراعنة للأدوية (Pharco)',
    prescriptionRequired: true,
    barcode: '622112345042',
    descriptionAr: 'بديل تجاري لاسترين الكوليسترول متوفر بتكلفة مناسبة.',
    notes: 'بديل تجاري مكافئ.'
  },

  // Omeprazole
  {
    id: 'losec_20',
    tradeNameAr: 'لوسك 20 مجم',
    tradeNameEn: 'Losec 20mg (MUPS)',
    activeIngredientId: 'omeprazole',
    strength: '20 مجم',
    dosageForm: 'أقراص مغلفة معوية الحبيبات',
    manufacturer: 'أسترازينيكا (AstraZeneca)',
    prescriptionRequired: true,
    barcode: '622112345050',
    descriptionAr: 'الدواء الأصلي المبتكر لمادة الأوميبرازول لعلاج قرحة المعدة والارتجاع المريئي وحرقة الفؤاد.',
    notes: 'يؤخذ صباحاً على الريق.'
  },
  {
    id: 'gasec_20',
    tradeNameAr: 'جاسك 20 مجم',
    tradeNameEn: 'Gasec 20mg',
    activeIngredientId: 'omeprazole',
    strength: '20 مجم',
    dosageForm: 'كبسولات معوية',
    manufacturer: 'شركة دار الدواء (Dar Al Dawa)',
    prescriptionRequired: true,
    barcode: '622112345051',
    descriptionAr: 'بديل إقليمي ممتاز للوسك لعلاج الحموضة وقرحة المعدة والاثني عشر.',
    notes: 'بديل مباشر مطابق.'
  },
  {
    id: 'omepak_20',
    tradeNameAr: 'أوميباك 20 مجم',
    tradeNameEn: 'Omepak 20mg',
    activeIngredientId: 'omeprazole',
    strength: '20 مجم',
    dosageForm: 'كبسولات',
    manufacturer: 'شركة سيبلا (Cipla) / حكمة',
    prescriptionRequired: true,
    barcode: '622112345052',
    descriptionAr: 'كبسولات أوميبرازول سريعة الامتصاص لحماية المعدة وتقليل الحموضة.',
    notes: 'بديل متوفر واسع الاستخدام.'
  },

  // Cetirizine
  {
    id: 'zyrtec_10',
    tradeNameAr: 'زيرتك 10 مجم',
    tradeNameEn: 'Zyrtec 10mg',
    activeIngredientId: 'cetirizine',
    strength: '10 مجم',
    dosageForm: 'أقراص مغلفة / شراب / نقط',
    manufacturer: 'شركة يو سي بي (UCB Pharma)',
    prescriptionRequired: false,
    barcode: '622112345060',
    descriptionAr: 'مضاد الحساسية الرائد عالمياً للرشح والعطس وحكة الجلد بدون تأثير منوم قوي.',
    notes: 'قرص واحد يومياً مساءً.'
  },
  {
    id: 'cetrak_10',
    tradeNameAr: 'سيتراك 10 مجم',
    tradeNameEn: 'Cetrak 10mg',
    activeIngredientId: 'cetirizine',
    strength: '10 مجم',
    dosageForm: 'أقراص مغلفة',
    manufacturer: 'شركة فاركو (Pharco)',
    prescriptionRequired: false,
    barcode: '622112345061',
    descriptionAr: 'بديل تجاري ممتاز للزيرتك يحتوي على نفس التركيز لعلاج حساسية الأنف والجلد.',
    notes: 'بديل اقتصادي مطابق.'
  },

  // Diclofenac Potassium
  {
    id: 'cataflam_50',
    tradeNameAr: 'كتافلام 50 مجم',
    tradeNameEn: 'Cataflam 50mg',
    activeIngredientId: 'diclofenac_potassium',
    strength: '50 مجم',
    dosageForm: 'أقراص سريعة المفعول',
    manufacturer: 'نوفارتس (Novartis)',
    prescriptionRequired: true,
    barcode: '622112345070',
    descriptionAr: 'مسكن آلام سريع الامتصاص لآلام الأسنان الحادة والصداع والعمليات الجراحية.',
    notes: 'يؤخذ بعد الأكل مع كوب ماء.'
  },
  {
    id: 'dolorex_50',
    tradeNameAr: 'دولوريكس 50 مجم',
    tradeNameEn: 'Dolorex 50mg',
    activeIngredientId: 'diclofenac_potassium',
    strength: '50 مجم',
    dosageForm: 'أقراص مغلفة',
    manufacturer: 'شركة سانوفي (Sanofi)',
    prescriptionRequired: true,
    barcode: '622112345071',
    descriptionAr: 'بديل تجاري مباشر للكتافلام لتسكين الآلام المفاجئة والمغص والتهاب الأسنان.',
    notes: 'بديل مكافئ سريع المفعول.'
  },

  // Azithromycin
  {
    id: 'zithromax_500',
    tradeNameAr: 'زيثرومكس 500 مجم',
    tradeNameEn: 'Zithromax 500mg',
    activeIngredientId: 'azithromycin',
    strength: '500 مجم',
    dosageForm: 'كبسولات / شراب معلق',
    manufacturer: 'فايزر (Pfizer)',
    prescriptionRequired: true,
    barcode: '622112345080',
    descriptionAr: 'مضاد حيوي شهير يؤخذ لمدة 3 أيام فقط لعلاج التهابات الصدر والحلق والجيوب الأنفية.',
    notes: 'جرعة واحدة يومياً لمدة 3 أيام.'
  },
  {
    id: 'azitrolid_500',
    tradeNameAr: 'أزيتروليد 500 مجم',
    tradeNameEn: 'Azitrolid 500mg',
    activeIngredientId: 'azithromycin',
    strength: '500 مجم',
    dosageForm: 'أقراص مغلفة',
    manufacturer: 'شركة سيديكو (SEDICO)',
    prescriptionRequired: true,
    barcode: '622112345081',
    descriptionAr: 'بديل محلي مطابق للزيثرومكس لعلاج الالتهابات الرئوية وحمى التيفود والجيوب.',
    notes: 'بديل مكافئ.'
  },

  // Bisoprolol
  {
    id: 'concor_5',
    tradeNameAr: 'كونكور 5 مجم',
    tradeNameEn: 'Concor 5mg',
    activeIngredientId: 'bisoprolol',
    strength: '5 مجم',
    dosageForm: 'أقراص مقسمة شكل قلب',
    manufacturer: 'ميرك (Merck)',
    prescriptionRequired: true,
    barcode: '622112345090',
    descriptionAr: 'دواء ضغط الدم والقلب الرائد لتنظيم النبض وعلاج ارتفاع الضغط وقصور الشرايين التاجية.',
    notes: 'يؤخذ صباحاً ولا يوقف فجأة.'
  },
  {
    id: 'bisocard_5',
    tradeNameAr: 'بيسوكارد 5 مجم',
    tradeNameEn: 'Bisocard 5mg',
    activeIngredientId: 'bisoprolol',
    strength: '5 مجم',
    dosageForm: 'أقراص مغلفة',
    manufacturer: 'شركة أدوية الحكمة (Hikma)',
    prescriptionRequired: true,
    barcode: '622112345091',
    descriptionAr: 'بديل معتمد عالي الجودة للكونكور يحتوي على بيسوبرولول 5 مجم لعلاج ضغط الدم والقلب.',
    notes: 'بديل مباشر مطابق للكونكور.'
  }
];

export const labReferencesList: LabReference[] = [
  // CBC Tests
  {
    id: 'wbc',
    code: 'WBC',
    aliases: ['White Blood Cells', 'Leukocytes', 'W.B.C', 'كرات الدم البيضاء'],
    nameAr: 'كرات الدم البيضاء (WBC)',
    nameEn: 'White Blood Cell Count',
    category: 'cbc',
    categoryAr: 'صورة الدم الكاملة (CBC)',
    minValue: 4.0,
    maxValue: 11.0,
    unit: '10^3/uL',
    normalDescriptionAr: 'النسبة في النطاق السليم وتعكس كفاءة الجهاز المناعي الطبيعية في محاربة العدوى والأمراض.',
    highMeaningAr: 'ارتفاع كرات الدم البيضاء يشير غالباً إلى وجود عدوى بكتيرية حادة، التهاب بالجسم، إجهاد بدني شديد، أو استجابة لبعض الأدوية مثل الكورتيزون.',
    lowMeaningAr: 'انخفاضها يشير إلى ضعف مؤقت في المناعة، عدوى فيروسية (مثل الإنفلونزا)، نقص فيتامين ب12، أو تثبيط في نخاع العظام.',
    homeAdviceAr: 'إذا كانت مرتفعة مع حمى، راجع الطبيب لتحديد مصدر العدوى. احرص على شرب السوائل وأخذ قسط وافر من الراحة وتجنب مخالطة المرضى عند انخفاضها.'
  },
  {
    id: 'rbc',
    code: 'RBC',
    aliases: ['Red Blood Cells', 'Erythrocytes', 'R.B.C', 'كرات الدم الحمراء'],
    nameAr: 'كرات الدم الحمراء (RBC)',
    nameEn: 'Red Blood Cell Count',
    category: 'cbc',
    categoryAr: 'صورة الدم الكاملة (CBC)',
    minValue: 4.3,
    maxValue: 5.9,
    unit: '10^6/uL',
    normalDescriptionAr: 'تعداد طبيعي لكرات الدم الحمراء المسؤولة عن نقل الأكسجين من الرئتين إلى جميع خلايا الجسم.',
    highMeaningAr: 'قد يدل على جفاف الجسم ونقص السوائل، التدخين المزمن، العيش في المرتفعات، أو أمراض نخاع العظم.',
    lowMeaningAr: 'مؤشر مباشر على الإصابة بفقر الدم (الأنيميا)، سوء التغذية، النزيف الحاد أو المزمن، أو نقص الحديد.',
    homeAdviceAr: 'في حال الانخفاض يُنصح بفحص مستوى مخزون الحديد (Ferritin) وتناول الأغذية الغنية بالحديد كاللحوم الحمراء والسبانخ والحبوب الكاملة.'
  },
  {
    id: 'hgb',
    code: 'HGB',
    aliases: ['Hemoglobin', 'Hb', 'الهيموجلوبين', 'خضاب الدم'],
    nameAr: 'الهيموجلوبين (Hb / HGB)',
    nameEn: 'Hemoglobin Concentration',
    category: 'cbc',
    categoryAr: 'صورة الدم الكاملة (CBC)',
    minValue: 13.0,
    maxValue: 17.5,
    unit: 'g/dL',
    normalDescriptionAr: 'مستوى الهيموجلوبين ممتاز ويضمن وصول كميات كافية من الأكسجين لأعضاء الجسم دون تعب أو إجهاد.',
    highMeaningAr: 'قد ينجم عن التدخين، الجفاف الشديد، أمراض الرئة المزمنة، أو فرط إنتاج كريات الدم الحمراء.',
    lowMeaningAr: 'دليل مؤكد على فقر الدم (الأنيميا)، مما يسبب الدوار وشحوب الوجه والتعب السريع عند بذل أي مجهود وخفقان القلب.',
    homeAdviceAr: 'إذا كانت النتيجة أقل من 11، ينبغي استشارة الطبيب لتحديد نوع الأنيميا (نقص حديد، ب12، أو وراثية) لتحديد المكمل الغذائي المناسب.'
  },
  {
    id: 'plt',
    code: 'PLT',
    aliases: ['Platelets', 'Thrombocytes', 'الصفائح الدموية'],
    nameAr: 'الصفائح الدموية (Platelets)',
    nameEn: 'Platelet Count',
    category: 'cbc',
    categoryAr: 'صورة الدم الكاملة (CBC)',
    minValue: 150,
    maxValue: 450,
    unit: '10^3/uL',
    normalDescriptionAr: 'عدد الصفائح سليم ويضمن تجلط الدم الطبيعي عند حدوث الجروح دون زيادة في خطر النزيف أو التجلط.',
    highMeaningAr: 'قد يحدث كرد فعل لالتهاب مزمن، نقص حديد، أو بعد استئصال الطحال.',
    lowMeaningAr: 'يزيد من خطر النزيف وظهور كدمات زرقاء غير مبررة على الجلد ونزيف اللثة والأنف.',
    homeAdviceAr: 'إذا كان هناك انخفاض ملحوظ وظهور كدمات، توقف عن تناول الأسبرين ومسكنات NSAID وراجع طبيب أمراض الدم فوراً.'
  },

  // Blood Sugar Tests
  {
    id: 'glu_fasting',
    code: 'GLU_FASTING',
    aliases: ['Fasting Blood Sugar', 'FBS', 'Glucose Fasting', 'سكر صائم', 'الجلوكوز صائم'],
    nameAr: 'سكر الدم الصائم (FBS)',
    nameEn: 'Fasting Blood Glucose',
    category: 'blood_sugar',
    categoryAr: 'السكر والأيض',
    minValue: 70,
    maxValue: 99,
    unit: 'mg/dL',
    normalDescriptionAr: 'مستوى سكر صائم طبيعي جداً ويعكس توازناً ممتازاً في إفراز هرمون الإنسولين.',
    highMeaningAr: 'القيم بين 100 و125 تشير إلى مرحلة "ما قبل السكري". القيم 126 أو أكثر في اختبارين منفصلين تشير إلى الإصابة بداء السكري.',
    lowMeaningAr: 'انخفاض أقل من 70 يمثل هبوط سكر قد يترافق مع تعرق، رجفة في اليدين، دوخة، وتشوش ذهني.',
    homeAdviceAr: 'في حال الارتفاع: تقليل السكريات والمشروبات المحلاة، ممارسة المشي 30 دقيقة يومياً، واستشارة الطبيب لإجراء فحص السكر التراكمي.',
    preparationAdviceAr: 'يتطلب صياماً تاماً عن الطعام والشراب (عدا الماء) لمدة 8 إلى 10 ساعات قبل سحب العينة.'
  },
  {
    id: 'hba1c',
    code: 'HBA1C',
    aliases: ['HbA1c', 'Glycated Hemoglobin', 'A1c', 'السكر التراكمي', 'الهيموجلوبين السكري'],
    nameAr: 'السكر التراكمي (HbA1c)',
    nameEn: 'Hemoglobin A1c (Glycated Hb)',
    category: 'blood_sugar',
    categoryAr: 'السكر والأيض',
    minValue: 4.0,
    maxValue: 5.6,
    unit: '%',
    normalDescriptionAr: 'معدل سكر تراكمي طبيعي تماماً، مما يدل على انضباط السكر في الدم خلال الأشهر الثلاثة الماضية.',
    highMeaningAr: '5.7% إلى 6.4% تعني مرحلة ما قبل السكري (خطر مرتفع). 6.5% فأكثر تدل على مرض السكري. ولمريض السكري الهدف هو أقل من 7%.',
    lowMeaningAr: 'نادراً ما يكون منخفضاً، وقد ينجم عن فقر دم انحلالي أو نوبات هبوط متكررة.',
    homeAdviceAr: 'الالتزام بنظام غذائي منخفض الكربوهيدرات والنشويات البسيطة، ممارسة التمارين الرياضية، ومتابعة العلاج بانتظام.'
  },

  // Lipid Profile
  {
    id: 'chol_total',
    code: 'CHOL',
    aliases: ['Total Cholesterol', 'Cholesterol', 'الكوليسترول الكلي'],
    nameAr: 'الكوليسترول الكلي (Total Cholesterol)',
    nameEn: 'Total Serum Cholesterol',
    category: 'lipids',
    categoryAr: 'دهون الدم (Lipid Profile)',
    minValue: 125,
    maxValue: 200,
    unit: 'mg/dL',
    normalDescriptionAr: 'المستوى صحي وأقل من 200 ملجم/ديسيلتر، مما يقلل احتمالية ترسب الدهون في الأوعية الدموية.',
    highMeaningAr: 'القيم بين 200 و239 تعتبر على الحافة (Borderline). القيم 240 فأعلى تشير إلى ارتفاع الكوليسترول وزيادة خطر تصلب الشرايين والجلطات.',
    lowMeaningAr: 'نادراً ما يكون مشكلة، ولكنه قد يظهر في حالات سوء التغذية الشديد أو فرط نشاط الغدة الدرقية.',
    homeAdviceAr: 'استبدل الزيوت المهدرجة بزيت الزيتون، قلل الوجبات السريعة والمقليات، وتناول الأسماك الدهنية كالسلمون والتونة.',
    preparationAdviceAr: 'يتطلب صياماً من 10 إلى 12 ساعة قبل الفحص للحصول على أدق نتيجة.'
  },
  {
    id: 'trig',
    code: 'TRIG',
    aliases: ['Triglycerides', 'TG', 'الدهون الثلاثية'],
    nameAr: 'الدهون الثلاثية (Triglycerides)',
    nameEn: 'Serum Triglycerides',
    category: 'lipids',
    categoryAr: 'دهون الدم (Lipid Profile)',
    minValue: 40,
    maxValue: 150,
    unit: 'mg/dL',
    normalDescriptionAr: 'مستوى الدهون الثلاثية طبيعي تماماً وأقل من 150 ملجم/ديسيلتر.',
    highMeaningAr: 'الارتفاع فوق 150 يرتبط بزيادة السعرات الحرارية والسكريات والوزن الزائد. الارتفاع فوق 500 يزيد خطر التهاب البنكرياس الحاد.',
    lowMeaningAr: 'طبيعي ومفيد ولا يدعو للقلق في الغالب.',
    homeAdviceAr: 'الامتناع عن السكريات والمياه الغازية والحلويات هو العامل الأسرع والأكثر فاعلية لخفض الدهون الثلاثية في غضون أسابيع قليلة.'
  },
  {
    id: 'hdl',
    code: 'HDL',
    aliases: ['HDL Cholesterol', 'High Density Lipoprotein', 'الكوليسترول الحميد', 'الكوليسترول النافع'],
    nameAr: 'الكوليسترول النافع (HDL)',
    nameEn: 'High-Density Lipoprotein',
    category: 'lipids',
    categoryAr: 'دهون الدم (Lipid Profile)',
    minValue: 40,
    maxValue: 70,
    unit: 'mg/dL',
    normalDescriptionAr: 'مستوى جيد؛ حيث يعمل هذا الكوليسترول كمكنسة تنظف الشرايين من الدهون الضارة وتعيدها للكبد.',
    highMeaningAr: 'القيم فوق 60 تعتبر ممتازة جداً ومحفزة لحماية القلب من الأزمات.',
    lowMeaningAr: 'انخفاضه لأقل من 40 للرجال أو 50 للنساء يزيد من خطر الإصابة بأمراض الشرايين التاجية.',
    homeAdviceAr: 'ممارسة الرياضة الهوائية كالمشي والهرولة، الإقلاع عن التدخين، وتناول المكسرات النيئة يرفع مستوى الكوليسترول النافع بفاعلية.'
  },
  {
    id: 'ldl',
    code: 'LDL',
    aliases: ['LDL Cholesterol', 'Low Density Lipoprotein', 'الكوليسترول الضار', 'الكوليسترول السيء'],
    nameAr: 'الكوليسترول الضار (LDL)',
    nameEn: 'Low-Density Lipoprotein',
    category: 'lipids',
    categoryAr: 'دهون الدم (Lipid Profile)',
    minValue: 50,
    maxValue: 100,
    unit: 'mg/dL',
    normalDescriptionAr: 'النتيجة مثالية وأقل من 100 ملجم/ديسيلتر، مما يوفر حماية للأوعية الدموية.',
    highMeaningAr: 'زيادته تسبب تراكم اللويحات الدهنية في جدران الشرايين وتضيقها، مما يرفع خطر النوبات القلبية والسكتات.',
    lowMeaningAr: 'ممتاز؛ كلما انخفض لدى مرضى القلب والضغط كان أفضل.',
    homeAdviceAr: 'إذا كانت النتيجة مرتفعة، ناقش مع الطبيب ضرورة بدء علاج بالستاتين (مثل أتورفاستاتين) مع حمية قليلة الدسم المشبع.'
  },

  // Kidney Function Tests
  {
    id: 'creatinine',
    code: 'CREAT',
    aliases: ['Serum Creatinine', 'Creat', 'الكرياتينين'],
    nameAr: 'الكرياتينين في مصل الدم (Creatinine)',
    nameEn: 'Serum Creatinine',
    category: 'kidney',
    categoryAr: 'وظائف الكلى',
    minValue: 0.6,
    maxValue: 1.2,
    unit: 'mg/dL',
    normalDescriptionAr: 'النسبة طبيعية وتدل على كفاءة وقدرة الكليتين على تصفية وفلترة الفضلات من مجرى الدم.',
    highMeaningAr: 'ارتفاع الكرياتينين هو المؤشر الرئيسي على ضعف وظائف الكلى أو الفشل الكلوي الحاد/المزمن أو الجفاف الشديد أو تأثير أدوية كالمسكنات.',
    lowMeaningAr: 'قد يحدث بسبب قلة الكتلة العضلية أو الحمل أو سوء التغذية الشديد، ونادراً ما يكون خطيراً.',
    homeAdviceAr: 'شرب 2 إلى 3 لترات من الماء يومياً، وتجنب الإفراط في المسكنات مثل الإيبوبروفين والديكلوفيناك لحماية أنسجة الكلى.'
  },
  {
    id: 'urea',
    code: 'UREA',
    aliases: ['Blood Urea', 'BUN', 'Urea', 'البولينا', 'اليوريا'],
    nameAr: 'اليوريا / البولينا (Urea / BUN)',
    nameEn: 'Blood Urea Nitrogen',
    category: 'kidney',
    categoryAr: 'وظائف الكلى',
    minValue: 15,
    maxValue: 45,
    unit: 'mg/dL',
    normalDescriptionAr: 'المعدل سليم، والكلى تقوم بالتخلص من النيتروجين الناتج عن هضم البروتينات بكفاءة.',
    highMeaningAr: 'قد ينجم عن الجفاف وقلة شرب السوائل، الإفراط في تناول البروتينات، النزيف الهضمي، أو القصور الكلوي.',
    lowMeaningAr: 'قد يدل على حمية قليلة البروتين أو فرط شرب السوائل أو مشكلات في الكبد.',
    homeAdviceAr: 'احرص على ترطيب الجسم بالسوائل بانتظام، وأعد الفحص إذا كان مصحوباً بارتفاع الكرياتينين.'
  },
  {
    id: 'uric_acid',
    code: 'URIC',
    aliases: ['Uric Acid', 'حمض اليوريك', 'حمض البوليك', 'النقرس'],
    nameAr: 'حمض اليوريك (Uric Acid)',
    nameEn: 'Serum Uric Acid',
    category: 'kidney',
    categoryAr: 'وظائف الكلى',
    minValue: 3.5,
    maxValue: 7.2,
    unit: 'mg/dL',
    normalDescriptionAr: 'النسبة طبيعية، ولا يوجد مؤشر على تراكم بلورات حمض اليوريك في المفاصل.',
    highMeaningAr: 'يزيد من خطر الإصابة بنوبات النقرس الحادة (ألم والتهاب شديد في إصبع القدم الأكبر) وتكون حصوات الكلى.',
    lowMeaningAr: 'غير مقلق عادة.',
    homeAdviceAr: 'التقليل من تناول اللحوم الحمراء، الكبدة، المأكولات البحرية، والمشروبات السكرية، والإكثار من الماء وعصير الليمون.'
  },

  // Liver Function Tests
  {
    id: 'alt_sgpt',
    code: 'ALT',
    aliases: ['SGPT', 'Alanine Aminotransferase', 'ALT', 'إنزيم الكبد ALT'],
    nameAr: 'إنزيم الكبد (ALT / SGPT)',
    nameEn: 'Alanine Aminotransferase',
    category: 'liver',
    categoryAr: 'وظائف الكبد',
    minValue: 7,
    maxValue: 55,
    unit: 'U/L',
    normalDescriptionAr: 'إنزيم الكبد في الحدود الطبيعية ويدل على سلامة خلايا الكبد وخلوها من الالتهاب النشط.',
    highMeaningAr: 'ارتفاعه علامة على تضرر خلايا الكبد، مثل الكبد الدهني، التهاب الكبد الفيروسي، أو تأثير بعض الأدوية أو المكملات المغشوشة.',
    lowMeaningAr: 'مستوى طبيعي وآمن تماماً.',
    homeAdviceAr: 'تجنب الأدوية غير الضرورية، التخلص من دهون الكبد بإنقاص الوزن وممارسة الرياضة، وإجراء فحص سونار للكبد إذا استمر الارتفاع.'
  },
  {
    id: 'ast_sgot',
    code: 'AST',
    aliases: ['SGOT', 'Aspartate Aminotransferase', 'AST', 'إنزيم الكبد AST'],
    nameAr: 'إنزيم الكبد (AST / SGOT)',
    nameEn: 'Aspartate Aminotransferase',
    category: 'liver',
    categoryAr: 'وظائف الكبد',
    minValue: 8,
    maxValue: 48,
    unit: 'U/L',
    normalDescriptionAr: 'مستوى طبيعي وصحي في الدم.',
    highMeaningAr: 'يوجد في الكبد وعضلة القلب والعضلات الهيكلية؛ ارتفاعه قد يعني إجهاداً في الكبد أو إجهاداً عضلياً عنيفاً.',
    lowMeaningAr: 'مستوى طبيعي وآمن.',
    homeAdviceAr: 'يُقرأ دائماً بالتزامن مع ALT لتحديد ما إذا كان مصدر المشكلة في الكبد أم في الأنسجة العضلية.'
  },

  // Vitamins & Hormones
  {
    id: 'vitamin_d',
    code: 'VITD',
    aliases: ['Vitamin D', '25-OH Vitamin D', 'فيتامين د', 'فيتامين د3'],
    nameAr: 'فيتامين د (25-OH Vitamin D)',
    nameEn: '25-Hydroxy Vitamin D',
    category: 'vitamins_hormones',
    categoryAr: 'الفيتامينات والغدد',
    minValue: 30,
    maxValue: 100,
    unit: 'ng/mL',
    normalDescriptionAr: 'المستوى مثالي وكافٍ لدعم صحة العظام والأسنان والمناعة وتحسين المزاج.',
    highMeaningAr: 'فوق 100 يعتبر مرتفعاً، وفوق 150 قد يسبب تسمم فيتامين د وتكلس الكالسيوم في الكلى.',
    lowMeaningAr: 'أقل من 20 يعتبر نقصاً حاداً، مسبباً آلام العظام وتساقط الشعر والتعب الدائم وضعف المناعة.',
    homeAdviceAr: 'التعرض لأشعة الشمس المباشرة 15 دقيقة يومياً صباحاً، وتناول مكملات فيتامين د3 الأسبوعية وفق الجرعة التي يحددها الطبيب.'
  },
  {
    id: 'tsh',
    code: 'TSH',
    aliases: ['Thyroid Stimulating Hormone', 'TSH', 'هرمون الغدة الدرقية', 'المحفز للدرقية'],
    nameAr: 'الهرمون المحفز للغدة الدرقية (TSH)',
    nameEn: 'Thyroid Stimulating Hormone',
    category: 'vitamins_hormones',
    categoryAr: 'الفيتامينات والغدد',
    minValue: 0.4,
    maxValue: 4.2,
    unit: 'uIU/mL',
    normalDescriptionAr: 'نشاط الغدة الدرقية متوازن، ومعدلات الأيض وإنتاج الطاقة في الجسم تعمل بشكل سليم.',
    highMeaningAr: 'ارتفاع TSH يعني خمول وكسل في الغدة الدرقية (Hypothyroidism)، مسبباً زيادة الوزن، جفاف الجلد، الشعور بالبرد، والإمساك.',
    lowMeaningAr: 'انخفاض TSH يعني فرط نشاط الغدة الدرقية (Hyperthyroidism)، مسبباً فقدان الوزن السريع، العصبية، خفقان القلب، وفرط التعرق.',
    homeAdviceAr: 'إذا كانت النتيجة خارج النطاق، ينبغي استشارة طبيب الغدد الصماء لإجراء فحص هرموني FT3 وFT4 وتحديد العلاج الهرموني التعويضي.'
  },

  // Inflammation
  {
    id: 'crp',
    code: 'CRP',
    aliases: ['C-Reactive Protein', 'CRP', 'بروتين سي التفاعلي', 'مؤشر الالتهاب'],
    nameAr: 'بروتين سي التفاعلي (CRP)',
    nameEn: 'C-Reactive Protein (Qualitative/Quantitative)',
    category: 'inflammation',
    categoryAr: 'مؤشرات الالتهاب',
    minValue: 0.0,
    maxValue: 5.0,
    unit: 'mg/L',
    normalDescriptionAr: 'معدل سليم، ولا يوجد مؤشر على التهاب حاد نشط في الجسم.',
    highMeaningAr: 'يرتفع بسرعة وبشدة في حالات العدوى البكتيرية الحادة، نزلات الصدر، التهابات المفاصل الروماتيزمية، أو بعد العمليات الجراحية.',
    lowMeaningAr: 'طبيعي ومثالي جداً.',
    homeAdviceAr: 'مؤشر عام لوجود التهاب؛ يحتاج للطبيب لتحديد العضو المسبب للالتهاب ووصف العلاج المناسب.'
  }
];

export const sampleMedicineDemos = [
  {
    id: 'sample_panadol',
    name: 'علبة بانادول إكسترا (Panadol Extra)',
    subtitle: '500 مجم باراسيتامول + 65 مجم كافيين',
    category: 'مسكن آلام وخافض حرارة',
    previewUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
    mockData: {
      tradeName: 'Panadol Extra',
      activeIngredient: 'Paracetamol',
      strength: '500mg Paracetamol + 65mg Caffeine',
      manufacturer: 'GlaxoSmithKline (GSK)',
      confidence: 96,
      clarity: 'high'
    }
  },
  {
    id: 'sample_augmentin',
    name: 'علبة أوجمنتين 1 جم (Augmentin 1g)',
    subtitle: 'أموكسيسيلين + كلافولانيك (مضاد حيوي)',
    category: 'مضاد حيوي واسع المجال',
    previewUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=80',
    mockData: {
      tradeName: 'Augmentin 1g',
      activeIngredient: 'Amoxicillin + Clavulanic Acid',
      strength: '1000mg',
      manufacturer: 'GSK',
      confidence: 94,
      clarity: 'high'
    }
  },
  {
    id: 'sample_brufen',
    name: 'علبة بروفين 400 (Brufen 400mg)',
    subtitle: 'إيبوبروفين - مسكن ومضاد التهاب',
    category: 'مسكن ومضاد للالتهاب',
    previewUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&auto=format&fit=crop&q=80',
    mockData: {
      tradeName: 'Brufen 400mg',
      activeIngredient: 'Ibuprofen',
      strength: '400mg',
      manufacturer: 'Abbott',
      confidence: 92,
      clarity: 'high'
    }
  },
  {
    id: 'sample_nosifol',
    name: 'أكياس نوسيفول (NosiFol - Sakura Italia)',
    subtitle: 'إينوزيتول + فوليك أسيد + زنك + فيتامينات B',
    category: 'مكمل علاجي لدعم الخصوبة وتكيس المبايض',
    previewUrl: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=600&auto=format&fit=crop&q=80',
    mockData: {
      tradeName: 'NosiFol',
      activeIngredient: 'Inositol + Folic Acid + Zinc + Betaine + Vitamin B6 + Vitamin B12',
      strength: '30 Sachets of 5.5g',
      manufacturer: 'Sakura Italia',
      confidence: 97,
      clarity: 'high'
    }
  }
];

export const sampleLabDemos = [
  {
    id: 'sample_cbc_anemia',
    name: 'تقرير صورة دم كاملة (CBC) - حالة أنيميا خفيفة',
    subtitle: 'فحص هيموجلوبين، كرات دم بيضاء وحمراء، صفائح',
    category: 'فحص دم معملي',
    previewUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600&auto=format&fit=crop&q=80',
    tests: [
      { code: 'WBC', value: 7.2, unit: '10^3/uL', note: 'ضمن النطاق الطبيعي' },
      { code: 'RBC', value: 3.9, unit: '10^6/uL', note: 'منخفض قليلاً' },
      { code: 'HGB', value: 10.8, unit: 'g/dL', note: 'منخفض - فقر دم طفيف' },
      { code: 'PLT', value: 240, unit: '10^3/uL', note: 'سليم' }
    ]
  },
  {
    id: 'sample_metabolic_lipids',
    name: 'تقرير دهون وسكر الدم (Lipids & Diabetes)',
    subtitle: 'فحص كوليسترول، دهون ثلاثية، سكر تراكمي HbA1c',
    category: 'فحص كيمياء الدم',
    previewUrl: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=600&auto=format&fit=crop&q=80',
    tests: [
      { code: 'GLU_FASTING', value: 118, unit: 'mg/dL', note: 'مرحلة ما قبل السكري' },
      { code: 'HBA1C', value: 6.1, unit: '%', note: 'مرحلة ما قبل السكري' },
      { code: 'CHOL', value: 228, unit: 'mg/dL', note: 'مرتفع حدي' },
      { code: 'TRIG', value: 185, unit: 'mg/dL', note: 'مرتفع' },
      { code: 'HDL', value: 38, unit: 'mg/dL', note: 'منخفض' },
      { code: 'LDL', value: 142, unit: 'mg/dL', note: 'مرتفع' }
    ]
  },
  {
    id: 'sample_liver_kidney',
    name: 'تقرير وظائف الكبد والكلى (Liver & Kidney Panel)',
    subtitle: 'الكرياتينين، اليوريا، ALT، AST',
    category: 'وظائف الأعضاء الحيوية',
    previewUrl: 'https://images.unsplash.com/photo-1579165466791-788226ab6fb0?w=600&auto=format&fit=crop&q=80',
    tests: [
      { code: 'CREAT', value: 0.95, unit: 'mg/dL', note: 'وظائف كلى سليمة' },
      { code: 'UREA', value: 28, unit: 'mg/dL', note: 'طبيعي' },
      { code: 'ALT', value: 32, unit: 'U/L', note: 'طبيعي' },
      { code: 'AST', value: 26, unit: 'U/L', note: 'طبيعي' },
      { code: 'URIC', value: 5.4, unit: 'mg/dL', note: 'طبيعي' }
    ]
  }
];
